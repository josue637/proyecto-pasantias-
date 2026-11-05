import { ChipIcon } from "@/components/storefront/icons";
import Link from "next/link";

const footerLinks = [
  {
    title: "Explora",
    links: [
      ["Novedades", "/#productos"],
      ["Colecciones", "/#colecciones"],
      ["Calificaciones", "/#calificaciones"],
    ],
  },
  {
    title: "Te ayudamos",
    links: [
      ["Envíos y cambios", "/#footer"],
      ["Preguntas frecuentes", "/#footer"],
      ["Contáctanos", "/contacto"],
      ["Escríbenos", "mailto:contacto@luminatech.cl"],
    ],
  },
  {
    title: "Síguenos",
    links: [
      ["Instagram", "https://instagram.com"],
      ["Pinterest", "https://pinterest.com"],
    ],
  },
];

export function SiteFooter() {
  return (
    <footer className="site-footer" id="footer">
      <div className="footer-main">
        <div className="footer-brand">
          <Link className="brand" href="/" aria-label="Lúmina Tech, inicio">
            <span className="brand-mark">
              <ChipIcon width={19} height={19} />
            </span>
            <span className="brand-name">LÚMINA TECH</span>
          </Link>
          <p>Tecnología útil para conectar, crear y disfrutar más.</p>
        </div>
        {footerLinks.map((column) => (
          <div className="footer-column" key={column.title}>
            <h3>{column.title}</h3>
            {column.links.map(([label, href]) => (
              <a
                key={label}
                href={href}
                target={href.startsWith("https://") ? "_blank" : undefined}
                rel={href.startsWith("https://") ? "noreferrer" : undefined}
              >
                {label}
              </a>
            ))}
          </div>
        ))}
      </div>
      <div className="payment-methods">
        <h3>Medios de pago de ejemplo</h3>
        <div className="payment-badges" aria-label="Webpay, Transbank, Mercado Pago, PayPal, Visa y Mastercard">
          <span>Webpay</span>
          <span>Transbank</span>
          <span>Mercado Pago</span>
          <span>PayPal</span>
          <span>VISA</span>
          <span>Mastercard</span>
        </div>
        <p>Marcas y pasarelas ilustrativas; confirma las integraciones activas antes de vender.</p>
      </div>
      <div className="footer-bottom">
        <span>© 2026 Lúmina Tech. Todos los derechos reservados.</span>
        <span>Chile · CLP $</span>
      </div>
    </footer>
  );
}
