import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Política de cookies | Lúmina Tech",
  description:
    "Conoce qué cookies utiliza Lúmina Tech, para qué sirven y cómo cambiar tus preferencias.",
};

export default function CookiesPage() {
  return (
    <main className="cookie-policy">
      <Link className="cookie-policy-back" href="/">
        Volver a Lúmina Tech
      </Link>
      <p className="section-kicker">Privacidad y transparencia</p>
      <h1 className="section-title">Política de cookies</h1>
      <p>
        Esta página describe las categorías de cookies configurables en esta
        tienda de demostración. La configuración actual no integra servicios
        de analítica ni de publicidad.
      </p>

      <h2>Cookies esenciales</h2>
      <p>
        Son necesarias para recordar la elección de consentimiento que haces en
        el aviso. La tienda guarda esa elección en una cookie propia llamada{" "}
        <code>lumina_cookie_consent</code>, con una duración de hasta 180 días.
      </p>

      <h2>Cookies analíticas</h2>
      <p>
        Permitirían medir de forma agregada cómo se utiliza la tienda. No hay
        actualmente una herramienta analítica conectada a esta categoría.
      </p>

      <h2>Cookies de marketing</h2>
      <p>
        Podrían ayudar a medir campañas o personalizar publicidad. No hay
        actualmente una plataforma de publicidad conectada a esta categoría.
      </p>

      <h2>Cambiar tus preferencias</h2>
      <p>
        Puedes revisar o cambiar la elección desde el botón “Preferencias de
        cookies”, disponible en la parte inferior de la pantalla. Las
        categorías opcionales quedan desactivadas salvo que las autorices.
      </p>
      <p className="cookie-policy-demo-note">
        Antes de usar este texto en una tienda real, actualízalo para reflejar
        todos los proveedores, finalidades y plazos de conservación efectivos y
        solicita revisión legal.
      </p>
    </main>
  );
}
