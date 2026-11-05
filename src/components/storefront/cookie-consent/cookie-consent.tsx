"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

const COOKIE_NAME = "lumina_cookie_consent";
const COOKIE_MAX_AGE = 60 * 60 * 24 * 180;
const CONSENT_VERSION = 1;

type CookiePreferences = {
  essential: true;
  analytics: boolean;
  marketing: boolean;
};

type SavedConsent = CookiePreferences & {
  version: number;
  savedAt: string;
};

function isSavedConsent(value: unknown): value is SavedConsent {
  return (
    typeof value === "object" &&
    value !== null &&
    "version" in value &&
    value.version === CONSENT_VERSION &&
    "essential" in value &&
    value.essential === true &&
    "analytics" in value &&
    typeof value.analytics === "boolean" &&
    "marketing" in value &&
    typeof value.marketing === "boolean" &&
    "savedAt" in value &&
    typeof value.savedAt === "string"
  );
}

const defaultPreferences: CookiePreferences = {
  essential: true,
  analytics: false,
  marketing: false,
};

function readConsentCookie(): SavedConsent | null {
  const cookie = document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${COOKIE_NAME}=`));

  if (!cookie) return null;

  try {
    const parsed: unknown = JSON.parse(
      decodeURIComponent(cookie.slice(COOKIE_NAME.length + 1)),
    );

    if (isSavedConsent(parsed)) return parsed;
    console.warn("La cookie de consentimiento tiene un formato no válido.");
  } catch (error) {
    console.warn("No se pudo leer la cookie de consentimiento.", error);
  }

  return null;
}

export function CookieConsent() {
  const [initialized, setInitialized] = useState(false);
  const [hasConsent, setHasConsent] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [preferences, setPreferences] =
    useState<CookiePreferences>(defaultPreferences);
  const [saveError, setSaveError] = useState("");

  useEffect(() => {
    const savedConsent = readConsentCookie();

    if (savedConsent) {
      setPreferences({
        essential: true,
        analytics: savedConsent.analytics,
        marketing: savedConsent.marketing,
      });
      setHasConsent(true);
    }

    setInitialized(true);
  }, []);

  function saveConsent(nextPreferences: CookiePreferences) {
    const consent: SavedConsent = {
      ...nextPreferences,
      version: CONSENT_VERSION,
      savedAt: new Date().toISOString(),
    };
    const secure =
      window.location.protocol === "https:" ? "; Secure" : "";

    document.cookie = `${COOKIE_NAME}=${encodeURIComponent(JSON.stringify(consent))}; Path=/; Max-Age=${COOKIE_MAX_AGE}; SameSite=Lax${secure}`;

    if (!readConsentCookie()) {
      setSaveError(
        "No se pudo guardar tu elección en el navegador. Revisa la configuración de cookies e inténtalo nuevamente.",
      );
      return;
    }

    setPreferences(nextPreferences);
    setHasConsent(true);
    setSettingsOpen(false);
    setSaveError("");
  }

  function acceptAll() {
    saveConsent({ essential: true, analytics: true, marketing: true });
  }

  function rejectOptional() {
    saveConsent({ essential: true, analytics: false, marketing: false });
  }

  if (!initialized) return null;

  if (hasConsent && !settingsOpen) {
    return (
      <button
        className="cookie-preferences-trigger"
        type="button"
        onClick={() => setSettingsOpen(true)}
      >
        Preferencias de cookies
      </button>
    );
  }

  return (
    <aside className="cookie-consent" aria-labelledby="cookie-consent-title">
      <div className="cookie-consent-content">
        <div className="cookie-consent-copy">
          <p className="cookie-consent-eyebrow">Tu privacidad importa</p>
          <h2 id="cookie-consent-title">
            {hasConsent ? "Preferencias de cookies" : "Usamos cookies"}
          </h2>
          <p>
            Usamos cookies esenciales para recordar tus preferencias. Con tu
            permiso, también podríamos usar cookies analíticas o de marketing.
            Actualmente no hay herramientas de analítica ni publicidad
            conectadas; las categorías opcionales quedan guardadas para
            integraciones futuras.
          </p>
          <Link href="/cookies">Más información sobre cookies</Link>
        </div>

        <div className="cookie-consent-actions">
          {!settingsOpen && !hasConsent ? (
            <>
              <button
                className="cookie-button cookie-button-primary"
                type="button"
                onClick={acceptAll}
              >
                Aceptar todas
              </button>
              <button
                className="cookie-button"
                type="button"
                onClick={rejectOptional}
              >
                Rechazar opcionales
              </button>
              <button
                className="cookie-button cookie-button-link"
                type="button"
                onClick={() => setSettingsOpen(true)}
              >
                Configurar
              </button>
            </>
          ) : (
            <>
              <fieldset className="cookie-category-list">
                <legend>Elige qué cookies permites</legend>
                <label className="cookie-category">
                  <input type="checkbox" checked disabled />
                  <span>
                    <strong>Esenciales</strong>
                    <small>Necesarias para guardar tus preferencias.</small>
                  </span>
                  <span className="cookie-always-on">Siempre activas</span>
                </label>
                <label className="cookie-category">
                  <input
                    type="checkbox"
                    checked={preferences.analytics}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        analytics: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Analíticas</strong>
                    <small>Ayudan a entender el uso del sitio.</small>
                  </span>
                </label>
                <label className="cookie-category">
                  <input
                    type="checkbox"
                    checked={preferences.marketing}
                    onChange={(event) =>
                      setPreferences((current) => ({
                        ...current,
                        marketing: event.target.checked,
                      }))
                    }
                  />
                  <span>
                    <strong>Marketing</strong>
                    <small>Permiten medir o personalizar publicidad.</small>
                  </span>
                </label>
              </fieldset>
              <button
                className="cookie-button cookie-button-primary"
                type="button"
                onClick={() => saveConsent(preferences)}
              >
                Guardar preferencias
              </button>
              {hasConsent && (
                <button
                  className="cookie-button cookie-button-link"
                  type="button"
                  onClick={() => {
                    setSettingsOpen(false);
                    setSaveError("");
                  }}
                >
                  Cancelar
                </button>
              )}
            </>
          )}
        </div>
        {saveError && (
          <p className="cookie-save-error" role="alert">
            {saveError}
          </p>
        )}
      </div>
    </aside>
  );
}
