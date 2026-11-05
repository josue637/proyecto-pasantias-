import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

export function Story() {
  return (
    <section className="story-section" id="historia">
      <div className="story-image">
        <Image
          src="https://images.unsplash.com/photo-1498050108023-c5249f4df085?auto=format&fit=crop&w=1000&q=75"
          alt="Espacio de trabajo con computador y tecnología"
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
      <div className="story-copy">
        <p className="section-kicker">Tecnología útil, sin complicaciones</p>
        <h2 className="section-title">Conectamos tus ideas con lo que necesitas.</h2>
        <p>
          En Lúmina reunimos dispositivos y accesorios que hacen más fácil
          trabajar, comunicarte y disfrutar tu tiempo. Una selección clara,
          precios en pesos chilenos y despacho a todo el país.
        </p>
        <a className="button-primary" href="#productos">
          Ver productos destacados <ArrowRightIcon width={17} height={17} />
        </a>
      </div>
    </section>
  );
}
