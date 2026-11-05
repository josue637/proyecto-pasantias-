import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

const categories = [
  {
    title: "Audio",
    category: "Audio inalámbrico",
    count: "Audífonos y sonido",
    image:
      "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=75",
    alt: "Audífonos modernos para escuchar música",
  },
  {
    title: "Accesorios móviles",
    category: "Accesorios móviles",
    count: "Carga y conectividad",
    image:
      "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?auto=format&fit=crop&w=700&q=75",
    alt: "Teléfono inteligente de última generación",
  },
  {
    title: "Wearables",
    category: "Relojes inteligentes",
    count: "Tecnología que llevas contigo",
    image:
      "https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=700&q=75",
    alt: "Reloj inteligente con pantalla digital",
  },
  {
    title: "Hogar inteligente",
    category: "Hogar inteligente",
    count: "Seguridad y automatización",
    image:
      "https://images.unsplash.com/photo-1558002038-1055907df827?auto=format&fit=crop&w=700&q=75",
    alt: "Dispositivos conectados para una casa inteligente",
  },
];

export function CategoryGrid() {
  return (
    <section className="categories-section" id="colecciones">
      <div className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Explora por categoría</p>
            <h2 className="section-title">Tecnología para cada momento.</h2>
          </div>
          <a className="text-link" href="#productos">
            Ver productos <ArrowRightIcon width={16} height={16} />
          </a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a
              className="category-card"
              href={`/colecciones?categoria=${encodeURIComponent(category.category)}`}
              key={category.title}
            >
              <div className="category-image">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
                  loading="lazy"
                  quality={70}
                  sizes={index === 0 ? "(max-width: 640px) 50vw, 35vw" : "(max-width: 640px) 50vw, 25vw"}
                />
              </div>
              <div className="category-info">
                <h3>{category.title}</h3>
                <span>{category.count}</span>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  );
}
