"use client";

import { useState, type FormEvent } from "react";

const supportEmail = "contacto@luminatech.cl";

export function Contact() {
  const [submitted, setSubmitted] = useState(false);

  function sendMessage(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const name = String(formData.get("name") ?? "");
    const email = String(formData.get("email") ?? "");
    const message = String(formData.get("message") ?? "");
    const subject = encodeURIComponent(`Consulta desde la tienda - ${name}`);
    const body = encodeURIComponent(
      `Nombre: ${name}\nCorreo: ${email}\n\nMensaje:\n${message}`,
    );

    window.location.href = `mailto:${supportEmail}?subject=${subject}&body=${body}`;
    setSubmitted(true);
  }

  return (
    <section className="contact-section" id="contacto" aria-labelledby="contact-title">
      <div className="section-wrap contact-layout">
        <div className="contact-details">
          <p className="section-kicker">Estamos para ayudarte</p>
          <h2 className="section-title" id="contact-title">
            Hablemos de tecnología.
          </h2>
          <p>
            ¿Tienes dudas sobre un producto o tu pedido? Escríbenos y te
            responderemos lo antes posible.
          </p>
          <a className="contact-email" href={`mailto:${supportEmail}`}>
            {supportEmail}
          </a>
          <p className="contact-location">
            Santiago, Chile <span>(ubicación de ejemplo)</span>
          </p>
        </div>
        <form className="contact-form" onSubmit={sendMessage}>
          <label>
            Nombre
            <input name="name" type="text" autoComplete="name" required />
          </label>
          <label>
            Correo electrónico
            <input
              name="email"
              type="email"
              autoComplete="email"
              required
            />
          </label>
          <label>
            Mensaje
            <textarea name="message" rows={4} required />
          </label>
          <button className="button-primary" type="submit">
            {submitted ? "Abre tu correo para enviar" : "Enviar consulta"}
          </button>
          <p className="contact-form-note">
            Formulario de demostración: al enviar se abrirá tu aplicación de
            correo.
          </p>
        </form>
      </div>
    </section>
  );
}
