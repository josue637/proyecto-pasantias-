import type { Metadata } from "next";
import { Storefront } from "@/components/storefront/storefront";

export const metadata: Metadata = {
  title: "Tecnología y accesorios inteligentes en Chile | Lúmina Tech",
  description:
    "Compra tecnología para tu día a día en Chile: audífonos inalámbricos, relojes inteligentes, baterías portátiles y dispositivos para el hogar conectado.",
  keywords: [
    "tecnología en Chile",
    "audífonos inalámbricos",
    "relojes inteligentes",
    "accesorios móviles",
    "hogar inteligente",
  ],
};

export default function Home() {
  return <Storefront />;
}
