import { products } from "@/data/products";

export function getConfiguredProductPrices() {
  const rawPrices = process.env.PRODUCT_USD_PRICES_JSON;
  if (!rawPrices) return null;

  let parsed: unknown;
  try {
    parsed = JSON.parse(rawPrices);
  } catch (error) {
    console.error("PRODUCT_USD_PRICES_JSON no contiene JSON válido.", error);
    throw new Error("La configuración de precios no es válida.");
  }

  if (typeof parsed !== "object" || parsed === null || Array.isArray(parsed)) {
    throw new Error("La configuración de precios debe ser un objeto JSON.");
  }

  const configured: Record<string, number> = {};
  for (const product of products) {
    const rawPrice = (parsed as Record<string, unknown>)[product.id];
    if (typeof rawPrice !== "string" && typeof rawPrice !== "number") {
      return null;
    }

    const normalized = String(rawPrice);
    if (!/^\d+(?:\.\d{1,2})?$/.test(normalized)) {
      throw new Error(`El precio USD configurado para ${product.id} no es válido.`);
    }
    const price = Number(normalized);
    if (
      !Number.isSafeInteger(Math.round(price * 100)) ||
      price <= 0 ||
      price >= 100_000_000
    ) {
      throw new Error(`El precio USD configurado para ${product.id} no es válido.`);
    }
    configured[product.id] = price;
  }

  return configured;
}

export function getConfiguredPaymentDetails() {
  return {
    bank: process.env.PAYMENT_MOBILE_BANK ?? "",
    phone: process.env.PAYMENT_MOBILE_PHONE ?? "",
    id: process.env.PAYMENT_MOBILE_ID ?? "",
    owner: process.env.PAYMENT_MOBILE_OWNER ?? "",
  };
}

export function isPaymentInstructionsConfigured() {
  const details = getConfiguredPaymentDetails();
  return Object.values(details).every(Boolean);
}

export function getConfiguredCheckoutFees() {
  const shipping = process.env.SHIPPING_USD;
  const taxRate = process.env.TAX_RATE;
  if (shipping === undefined || taxRate === undefined) return null;
  if (!/^\d+(?:\.\d{1,2})?$/.test(shipping) || !/^(?:0(?:\.\d{1,4})?|1(?:\.0{1,4})?)$/.test(taxRate)) {
    throw new Error("SHIPPING_USD o TAX_RATE no tiene un valor válido.");
  }

  const shippingUsd = Number(shipping);
  const parsedTaxRate = Number(taxRate);
  if (shippingUsd < 0 || shippingUsd >= 100_000_000) {
    throw new Error("SHIPPING_USD debe ser un importe entre 0 y 99.999.999,99.");
  }

  return {
    shippingCents: Math.round(shippingUsd * 100),
    taxRate: parsedTaxRate,
    confirmed: process.env.CHECKOUT_FEES_CONFIRMED === "true",
  };
}
