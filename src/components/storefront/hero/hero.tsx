import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-image">
        <Image
          src="https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=1800&q=75"
          alt="Sala luminosa con muebles naturales y detalles cuidadosamente seleccionados"
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="hero-content">
        <p className="eyebrow">Colección primavera · 2026</p>
        <h1 id="hero-title">
          Un hogar que
          <br />
          se siente <em>tuyo.</em>
        </h1>
        <p className="hero-copy">
          Texturas nobles, formas honestas y pequeños detalles que convierten
          cualquier espacio en tu lugar favorito.
        </p>
        <a className="button-primary" href="#productos">
          Descubre la colección <ArrowRightIcon width={17} height={17} />
        </a>
      </div>
      <span className="hero-note">Diseño consciente, todos los días.</span>
    </section>
  );
}
