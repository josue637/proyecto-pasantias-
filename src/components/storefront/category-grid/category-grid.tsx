import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

const categories = [
  {
    title: "Objetos con alma",
    count: "18 piezas para descubrir",
    image:
      "https://images.unsplash.com/photo-1578749556568-bc2c40e68b61?auto=format&fit=crop&w=900&q=75",
    alt: "Piezas de cerámica artesanal en tonos cálidos",
  },
  {
    title: "Textiles",
    count: "Suavidad en cada detalle",
    image:
      "https://images.unsplash.com/photo-1600210491369-e753d80a41f3?auto=format&fit=crop&w=700&q=75",
    alt: "Textiles naturales en un espacio acogedor",
  },
  {
    title: "Iluminación",
    count: "Luz para bajar el ritmo",
    image:
      "https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=700&q=75",
    alt: "Lámpara de diseño con luz cálida",
  },
  {
    title: "Pequeños rituales",
    count: "Detalles para todos los días",
    image:
      "https://images.unsplash.com/photo-1603006905003-be475563bc59?auto=format&fit=crop&w=700&q=75",
    alt: "Vela artesanal y objetos para un momento de calma",
  },
];

export function CategoryGrid() {
  return (
    <section className="categories-section" id="colecciones">
      <div className="section-wrap">
        <div className="section-heading">
          <div>
            <p className="section-kicker">Encuentra tu inspiración</p>
            <h2 className="section-title">Un rincón para cada idea.</h2>
          </div>
          <a className="text-link" href="#productos">
            Ver todas las piezas <ArrowRightIcon width={16} height={16} />
          </a>
        </div>
        <div className="category-grid">
          {categories.map((category, index) => (
            <a className="category-card" href="#productos" key={category.title}>
              <div className="category-image">
                <Image
                  src={category.image}
                  alt={category.alt}
                  fill
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
