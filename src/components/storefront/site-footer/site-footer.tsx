import { LeafIcon } from "@/components/storefront/icons";

const footerLinks = [
  {
    title: "Explora",
    links: [
      ["Novedades", "#productos"],
      ["Colecciones", "#colecciones"],
      ["Nuestra historia", "#historia"],
    ],
  },
  {
    title: "Te ayudamos",
    links: [
      ["Envíos y cambios", "#footer"],
      ["Preguntas frecuentes", "#footer"],
      ["Contáctanos", "mailto:hola@lumina.cl"],
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
          <a className="brand" href="#" aria-label="Lúmina, inicio">
            <span className="brand-mark">
              <LeafIcon width={19} height={19} />
            </span>
            <span className="brand-name">LÚMINA</span>
          </a>
          <p>Objetos con intención para vivir bonito, a tu manera.</p>
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
      <div className="footer-bottom">
        <span>© 2026 Lúmina. Hecho con calma.</span>
        <span>Chile · CLP $</span>
      </div>
    </footer>
  );
}
