import { NextResponse } from "next/server";
import { isPaymentEmailConfigured } from "@/lib/payment-email";
import {
  getConfiguredCheckoutFees,
  getConfiguredPaymentDetails,
  getConfiguredProductPrices,
  isPaymentInstructionsConfigured,
} from "@/lib/product-pricing";

export const runtime = "nodejs";

export async function GET() {
  try {
    const prices = getConfiguredProductPrices();
    const fees = getConfiguredCheckoutFees();
    return NextResponse.json(
      {
        currency: "USD",
        pricesUsd: prices,
        pricesConfigured: prices !== null,
        shippingUsd: fees ? fees.shippingCents / 100 : null,
        taxRate: fees?.taxRate ?? null,
        feesConfirmed: fees?.confirmed ?? false,
        databaseConfigured: Boolean(process.env.DATABASE_URL),
        emailConfigured: isPaymentEmailConfigured(),
        paymentMobile: isPaymentInstructionsConfigured()
          ? getConfiguredPaymentDetails()
          : null,
      },
      { headers: { "Cache-Control": "no-store" } },
    );
  } catch (error) {
    console.error("La configuración de precios del checkout no es válida.", error);
    return NextResponse.json(
      { error: "La tienda tiene una configuración de precios inválida." },
      { status: 500 },
    );
  }
}
