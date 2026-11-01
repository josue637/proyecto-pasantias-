"use client";

import { useState, type FormEvent } from "react";
import { ArrowRightIcon } from "@/components/storefront/icons";

export function Newsletter() {
  const [subscribed, setSubscribed] = useState(false);

  function subscribe(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubscribed(true);
  }

  return (
    <section className="newsletter" aria-labelledby="newsletter-title">
      <p className="section-kicker">Una nota de vez en cuando</p>
      <h2 className="section-title" id="newsletter-title">
        Ideas bonitas, directo a tu correo.
      </h2>
      <p className="newsletter-copy">
        Novedades, inspiración y un 10% de bienvenida en tu primera compra.
      </p>
      <form className="newsletter-form" onSubmit={subscribe}>
        <input
          type="email"
          aria-label="Tu correo electrónico"
          placeholder="Tu correo electrónico"
          required
          disabled={subscribed}
        />
        <button type="submit" disabled={subscribed}>
          {subscribed ? "¡Gracias!" : "Quiero recibirlas"}
          {!subscribed && <ArrowRightIcon width={16} height={16} />}
        </button>
      </form>
    </section>
  );
}
