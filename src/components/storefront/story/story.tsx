import Image from "next/image";
import { ArrowRightIcon } from "@/components/storefront/icons";

export function Story() {
  return (
    <section className="story-section" id="historia">
      <div className="story-image">
        <Image
          src="https://images.unsplash.com/photo-1616486338812-3dadae4b4ace?auto=format&fit=crop&w=1200&q=85"
          alt="Interior sereno con materiales naturales y luz de tarde"
          fill
          sizes="(max-width: 640px) 100vw, 50vw"
        />
      </div>
      <div className="story-copy">
        <p className="section-kicker">Menos, pero mejor</p>
        <h2 className="section-title">Creemos en las cosas que se quedan.</h2>
        <p>
          En Lúmina elegimos piezas hechas con tiempo y materiales honestos.
          Colaboramos con talleres independientes para que cada objeto tenga una
          historia, y cada espacio, un poquito más de sentido.
        </p>
        <a className="button-primary" href="#historia">
          Conoce nuestra historia <ArrowRightIcon width={17} height={17} />
        </a>
      </div>
    </section>
  );
}
