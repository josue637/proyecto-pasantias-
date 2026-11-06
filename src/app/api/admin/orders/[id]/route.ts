import { OrderStatus } from "@prisma/client";
import { timingSafeEqual } from "node:crypto";
import { NextResponse, type NextRequest } from "next/server";
import { decryptPaymentDetails } from "@/lib/payment-security";
import { sendPaymentVerifiedEmail } from "@/lib/payment-email";
import { prisma } from "@/lib/prisma";

export const runtime = "nodejs";

type RouteContext = {
  params: Promise<{ id: string }>;
};

function isAuthorized(request: NextRequest) {
  const expected = process.env.ADMIN_PAYMENT_REVIEW_TOKEN;
  const authorization = request.headers.get("authorization");
  if (!expected || !authorization?.startsWith("Bearer ")) return false;

  const provided = authorization.slice("Bearer ".length);
  const expectedBuffer = Buffer.from(expected);
  const providedBuffer = Buffer.from(provided);
  return (
    expectedBuffer.length === providedBuffer.length &&
    timingSafeEqual(expectedBuffer, providedBuffer)
  );
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  let order;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber: id },
      include: { paymentSubmission: true, items: true },
    });
  } catch (error) {
    console.error("No se pudo consultar el pedido para revisión.", error);
    return NextResponse.json({ error: "No se pudo consultar el pedido." }, { status: 503 });
  }
  if (!order?.paymentSubmission) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }

  try {
    return NextResponse.json({
      orderNumber: order.orderNumber,
      status: order.status,
      currency: order.currency,
      totalUsd: order.total.toString(),
      vesTotal: order.vesTotal?.toString() ?? null,
      bcvRate: order.bcvRate?.toString() ?? null,
      customerEmail: order.customerEmail,
      items: order.items.map((item) => ({
        name: item.productName,
        quantity: item.quantity,
        unitPriceUsd: item.unitPrice.toString(),
      })),
      paymentReport: decryptPaymentDetails(order.paymentSubmission.encryptedPayerDetails),
      submittedAt: order.paymentSubmission.submittedAt,
    });
  } catch (error) {
    console.error(`No se pudieron leer los datos cifrados del pedido ${order.orderNumber}.`, error);
    return NextResponse.json(
      { error: "No se pudieron descifrar los datos del reporte de pago." },
      { status: 500 },
    );
  }
}

export async function POST(request: NextRequest, { params }: RouteContext) {
  if (!isAuthorized(request)) {
    return NextResponse.json({ error: "No autorizado." }, { status: 401 });
  }

  const { id } = await params;
  let order;
  try {
    order = await prisma.order.findUnique({
      where: { orderNumber: id },
      select: { id: true, orderNumber: true, customerEmail: true, status: true },
    });
  } catch (error) {
    console.error("No se pudo cargar el pedido para verificar el pago.", error);
    return NextResponse.json({ error: "No se pudo cargar el pedido." }, { status: 503 });
  }
  if (!order) {
    return NextResponse.json({ error: "Pedido no encontrado." }, { status: 404 });
  }
  if (order.status !== OrderStatus.PENDING_VERIFICATION) {
    return NextResponse.json(
      { error: "Solo se pueden verificar pedidos pendientes de verificación." },
      { status: 409 },
    );
  }

  let updated;
  try {
    updated = await prisma.order.updateMany({
      where: { id: order.id, status: OrderStatus.PENDING_VERIFICATION },
      data: { status: OrderStatus.PAID, paidAt: new Date() },
    });
  } catch (error) {
    console.error(`No se pudo actualizar el estado del pedido ${order.orderNumber}.`, error);
    return NextResponse.json({ error: "No se pudo actualizar el estado del pedido." }, { status: 503 });
  }
  if (updated.count !== 1) {
    return NextResponse.json(
      { error: "El estado del pedido cambió. Vuelve a cargarlo antes de verificar." },
      { status: 409 },
    );
  }

  let emailSent = false;
  try {
    emailSent = await sendPaymentVerifiedEmail(order.customerEmail, order.orderNumber);
    if (!emailSent) {
      console.error(`Pedido ${order.orderNumber} verificado; correo SMTP no configurado.`);
    }
  } catch (error) {
    console.error(`Pedido ${order.orderNumber} verificado; falló el correo de confirmación.`, error);
  }

  return NextResponse.json({
    orderNumber: order.orderNumber,
    status: OrderStatus.PAID,
    emailSent,
  });
}
