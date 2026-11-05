import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

export function Hero() {
  return (
    <section className="hero" aria-labelledby="hero-title">
      <div className="hero-image">
        <Image
          src="https://images.unsplash.com/photo-1519389950473-47ba0277781c?auto=format&fit=crop&w=1800&q=70"
          alt="Equipo trabajando con computadores y dispositivos tecnológicos"
          fill
          priority
          sizes="100vw"
        />
      </div>
      <div className="hero-content">
        <p className="eyebrow">Tecnología para tu día a día</p>
        <h1 id="hero-title">
          Tu mundo,
          <br />
          más <em>conectado.</em>
        </h1>
        <p className="hero-copy">
          Encuentra audífonos, accesorios inteligentes y tecnología útil para
          trabajar, crear y disfrutar más.
        </p>
        <a className="button-primary" href="#productos">
          Explora tecnología <ArrowRightIcon width={17} height={17} />
        </a>
      </div>
      <span className="hero-note">Tecnología elegida para acompañarte.</span>
    </section>
  );
}
