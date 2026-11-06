import type { Metadata } from "next";
import Link from "next/link";
import { Contact } from "@/components/storefront/contact/contact";
import { ChipIcon } from "@/components/storefront/icons";
import { SiteFooter } from "@/components/storefront/site-footer/site-footer";

export const metadata: Metadata = {
  title: "Contacto y soporte en Venezuela | Lúmina Tech",
  description:
    "Contacta al equipo de soporte de Lúmina Tech en Venezuela para resolver dudas sobre tecnología, productos y pedidos.",
};

export default function ContactPage() {
  return (
    <>
      <header className="contact-page-header">
        <Link className="brand" href="/" aria-label="Lúmina Tech, inicio">
          <span className="brand-mark">
            <ChipIcon width={19} height={19} />
          </span>
          <span className="brand-name">LÚMINA TECH</span>
        </Link>
        <Link href="/#productos">Volver a la tienda</Link>
      </header>
      <main>
        <Contact />
      </main>
      <SiteFooter />
    </>
  );
}
