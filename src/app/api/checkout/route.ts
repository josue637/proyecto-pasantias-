import { OrderStatus, Prisma } from "@prisma/client";
import { NextResponse, type NextRequest } from "next/server";
import { products } from "@/data/products";
import { usdCentsToVesCents, verifyBcvQuote } from "@/lib/bcv";
import { isPaymentEmailConfigured, sendPaymentPendingEmail } from "@/lib/payment-email";
import { encryptPaymentDetails, fingerprintPaymentReference } from "@/lib/payment-security";
import { prisma } from "@/lib/prisma";
import {
  getConfiguredCheckoutFees,
  getConfiguredPaymentDetails,
  getConfiguredProductPrices,
  isPaymentInstructionsConfigured,
} from "@/lib/product-pricing";

export const runtime = "nodejs";

type CheckoutItem = {
  id: string;
  quantity: number;
};

type CheckoutInput = {
  items: CheckoutItem[];
  customerEmail: string;
  payerName: string;
  payerId: string;
  payerPhone: string;
  payerBank: string;
  reference: string;
  rateQuote: string;
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

function parseCheckoutInput(value: unknown): CheckoutInput | null {
  if (!isRecord(value) || !Array.isArray(value.items) || value.items.length < 1 || value.items.length > 10) {
    return null;
  }

  const items: CheckoutItem[] = [];
  for (const item of value.items) {
    if (
      !isRecord(item) ||
      typeof item.id !== "string" ||
      !products.some((product) => product.id === item.id) ||
      !Number.isInteger(item.quantity) ||
      Number(item.quantity) < 1 ||
      Number(item.quantity) > 10
    ) {
      return null;
    }
    items.push({ id: item.id, quantity: Number(item.quantity) });
  }

  const fields = [
    "customerEmail",
    "payerName",
    "payerId",
    "payerPhone",
    "payerBank",
    "reference",
    "rateQuote",
  ] as const;
  if (fields.some((field) => typeof value[field] !== "string")) return null;

  const input: CheckoutInput = {
    items,
    customerEmail: value.customerEmail as string,
    payerName: value.payerName as string,
    payerId: value.payerId as string,
    payerPhone: value.payerPhone as string,
    payerBank: value.payerBank as string,
    reference: value.reference as string,
    rateQuote: value.rateQuote as string,
  };
  if (
    input.customerEmail.length > 254 ||
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(input.customerEmail) ||
    input.payerName.trim().length < 2 ||
    input.payerName.length > 100 ||
    !/^[VEJPG]-?\d{6,10}$/i.test(input.payerId.trim()) ||
    !/^(?:\+?58)?0?4(?:12|14|16|24|26)\d{7}$/.test(input.payerPhone.replace(/[\s()-]/g, "")) ||
    input.payerBank.trim().length < 2 ||
    input.payerBank.length > 100 ||
    !/^[a-zA-Z0-9-]{4,24}$/.test(input.reference.trim()) ||
    input.rateQuote.length > 2000
  ) {
    return null;
  }

  return { ...input, items };
}

function formatAmount(cents: number) {
  return (cents / 100).toFixed(2);
}

export async function POST(request: NextRequest) {
  const origin = request.headers.get("origin");
  if (origin && origin !== request.nextUrl.origin) {
    return NextResponse.json({ error: "Origen de solicitud no permitido." }, { status: 403 });
  }

  let input: CheckoutInput | null;
  try {
    input = parseCheckoutInput(await request.json());
  } catch (error) {
    console.warn("El checkout recibió un cuerpo JSON no válido.", error);
    return NextResponse.json({ error: "La solicitud de pago no es válida." }, { status: 400 });
  }
  if (!input) {
    return NextResponse.json(
      { error: "Revisa el correo, los datos de Pago Móvil y los productos seleccionados." },
      { status: 400 },
    );
  }

  let prices: Record<string, number> | null;
  try {
    prices = getConfiguredProductPrices();
  } catch (error) {
    console.error("La configuración de precios del checkout no es válida.", error);
    return NextResponse.json({ error: "La configuración de precios no es válida." }, { status: 500 });
  }
  if (!prices) {
    return NextResponse.json(
      { error: "El checkout no está activo: faltan los precios reales de los productos en USD." },
      { status: 503 },
    );
  }
  let fees;
  try {
    fees = getConfiguredCheckoutFees();
  } catch (error) {
    console.error("La configuración de cargos del checkout no es válida.", error);
    return NextResponse.json({ error: "La configuración de cargos no es válida." }, { status: 500 });
  }
  if (!fees || !fees.confirmed) {
    return NextResponse.json(
      { error: "El checkout no está activo: faltan confirmar los costos de envío e impuestos." },
      { status: 503 },
    );
  }
  if (!isPaymentInstructionsConfigured()) {
    return NextResponse.json(
      { error: "El checkout no está activo: faltan los datos receptores de Pago Móvil." },
      { status: 503 },
    );
  }
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "El checkout no está activo: falta configurar la base de datos PostgreSQL." },
      { status: 503 },
    );
  }
  if (!isPaymentEmailConfigured()) {
    return NextResponse.json(
      { error: "El checkout no está activo: falta configurar el correo SMTP de confirmación." },
      { status: 503 },
    );
  }

  let rate;
  try {
    rate = verifyBcvQuote(input.rateQuote);
  } catch (error) {
    console.error("No se pudo verificar la firma de la tasa BCV.", error);
    return NextResponse.json(
      { error: "La verificación de tasa BCV no está configurada." },
      { status: 503 },
    );
  }
  if (!rate) {
    return NextResponse.json(
      { error: "La cotización BCV expiró o no es válida. Actualiza la tasa y vuelve a reportar el pago." },
      { status: 409 },
    );
  }

  const subtotalCents = input.items.reduce((total, item) => {
    const unitPriceCents = Math.round(prices[item.id] * 100);
    return total + unitPriceCents * item.quantity;
  }, 0);
  const taxableCents = subtotalCents + fees.shippingCents;
  const taxCents = Math.round(taxableCents * fees.taxRate);
  const usdCents = subtotalCents + fees.shippingCents + taxCents;
  if (!Number.isSafeInteger(usdCents) || usdCents <= 0) {
    return NextResponse.json({ error: "El total del pedido no es válido." }, { status: 400 });
  }

  let encryptedPayerDetails: string;
  let referenceFingerprint: string;
  try {
    encryptedPayerDetails = encryptPaymentDetails({
      name: input.payerName.trim(),
      id: input.payerId.trim().toUpperCase(),
      phone: input.payerPhone.trim(),
      bank: input.payerBank.trim(),
      reference: input.reference.trim().toUpperCase(),
    });
    referenceFingerprint = fingerprintPaymentReference(input.reference);
  } catch (error) {
    console.error("No se pudieron proteger los datos del reporte de pago.", error);
    return NextResponse.json(
      { error: "El checkout no está configurado para proteger los datos de pago." },
      { status: 503 },
    );
  }

  const vesCents = usdCentsToVesCents(usdCents, rate.rate);
  if (!Number.isSafeInteger(vesCents)) {
    return NextResponse.json({ error: "El total convertido a VES no es válido." }, { status: 400 });
  }
  const productById = new Map(products.map((product) => [product.id, product]));
  const orderItems = [];
  for (const item of input.items) {
    const product = productById.get(item.id);
    if (!product) {
      return NextResponse.json({ error: "Uno de los productos ya no está disponible." }, { status: 400 });
    }
    const unitPriceCents = Math.round(prices[item.id] * 100);
    orderItems.push({
      productName: product.name,
      productSku: product.id,
      unitPrice: formatAmount(unitPriceCents),
      quantity: item.quantity,
    });
  }

  let order;
  try {
    order = await prisma.order.create({
      data: {
        status: OrderStatus.PENDING_VERIFICATION,
        currency: "USD",
        paymentMethod: "PAYMENT_MOBILE_MANUAL",
        subtotal: formatAmount(subtotalCents),
        shipping: formatAmount(fees.shippingCents),
        tax: formatAmount(taxCents),
        total: formatAmount(usdCents),
        bcvRate: rate.rate.toFixed(6),
        vesTotal: formatAmount(vesCents),
        customerEmail: input.customerEmail.trim().toLowerCase(),
        items: { create: orderItems },
        paymentSubmission: {
          create: { encryptedPayerDetails, referenceFingerprint },
        },
      },
      select: { id: true, orderNumber: true, customerEmail: true },
    });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json(
        { error: "Esta referencia de Pago Móvil ya fue reportada." },
        { status: 409 },
      );
    }
    console.error("No se pudo guardar el pedido en PostgreSQL.", error);
    return NextResponse.json(
      { error: "No se pudo guardar el pedido. Verifica la conexión de la tienda e inténtalo más tarde." },
      { status: 503 },
    );
  }

  let emailSent = false;
  try {
    const emailStatus = await sendPaymentPendingEmail({
      orderNumber: order.orderNumber,
      customerEmail: order.customerEmail,
      totalUsd: formatAmount(usdCents),
      totalVes: formatAmount(vesCents),
      rate: rate.rate.toFixed(6),
    });
    emailSent = emailStatus.customerSent;
    if (!emailStatus.customerSent || !emailStatus.storeSent) {
      console.error("El pedido se guardó, pero SMTP no está configurado para enviar todos los avisos.");
    }
  } catch (error) {
    console.error(`El pedido ${order.orderNumber} se guardó, pero falló el correo SMTP.`, error);
  }

  const receiver = getConfiguredPaymentDetails();
  return NextResponse.json(
    {
      orderNumber: order.orderNumber,
      status: OrderStatus.PENDING_VERIFICATION,
      currency: "USD",
      totalUsd: formatAmount(usdCents),
      totalVes: formatAmount(vesCents),
      bcvRate: rate.rate,
      bcvRateDate: rate.rateDate,
      paymentMethod: "Pago Móvil (reporte manual)",
      receiver: {
        bank: receiver.bank,
        phone: receiver.phone,
        id: receiver.id,
        owner: receiver.owner,
      },
      emailSent,
      message: "Pedido guardado y pendiente de verificación manual.",
    },
    { status: 201 },
  );
}
