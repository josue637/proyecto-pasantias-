import type { Metadata } from "next";
import { CheckoutForm } from "@/components/storefront/checkout/checkout-form";

export const metadata: Metadata = {
  title: "Checkout Pago Móvil | Lúmina Tech Venezuela",
  description:
    "Consulta el total de tu compra en USD y su equivalente en bolívares a la tasa oficial BCV, y reporta tu pago móvil.",
};

export default function CheckoutPage() {
  return (
    <main className="checkout-page">
      <CheckoutForm />
    </main>
  );
}
