"use client";

import Link from "next/link";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import { products } from "@/data/products";

type CartItem = {
  id: string;
  quantity: number;
};

type CheckoutConfig = {
  pricesUsd: Record<string, number> | null;
  pricesConfigured: boolean;
  shippingUsd: number | null;
  taxRate: number | null;
  feesConfirmed: boolean;
  databaseConfigured: boolean;
  emailConfigured: boolean;
  paymentMobile: {
    bank: string;
    phone: string;
    id: string;
    owner: string;
  } | null;
};

type RateResponse = {
  rate: number;
  rateDate: string;
  source: string;
  expiresAt: number;
  token: string;
};

type CreatedOrder = {
  orderNumber: string;
  status: string;
  totalUsd: string;
  totalVes: string;
  bcvRate: number;
  bcvRateDate: string;
  receiver: NonNullable<CheckoutConfig["paymentMobile"]>;
  emailSent: boolean;
  message: string;
};

function formatCurrency(value: number, currency: "USD" | "VES") {
  return new Intl.NumberFormat("es-VE", {
    style: "currency",
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value);
}

export function CheckoutForm() {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [config, setConfig] = useState<CheckoutConfig | null>(null);
  const [rate, setRate] = useState<RateResponse | null>(null);
  const [loadError, setLoadError] = useState("");
  const [formError, setFormError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [order, setOrder] = useState<CreatedOrder | null>(null);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    const timer = window.setInterval(() => setNow(Date.now()), 30_000);
    try {
      const saved = localStorage.getItem("lumina_cart");
      if (saved) {
        const parsed: unknown = JSON.parse(saved);
        if (
          Array.isArray(parsed) &&
          parsed.every(
            (item) =>
              typeof item?.id === "string" &&
              Number.isInteger(item.quantity) &&
              item.quantity > 0,
          )
        ) {
          setCartItems(parsed);
        }
      }
    } catch (error) {
      console.error("No se pudo leer el carrito guardado.", error);
      setLoadError("No pudimos recuperar tu carrito. Regresa a la tienda y vuelve a intentarlo.");
    }

    Promise.all([
      fetch("/api/payment-config").then(async (response) => {
        if (!response.ok) throw new Error("No se pudo cargar la configuración de pago.");
        return (await response.json()) as CheckoutConfig;
      }),
      fetch("/api/exchange-rate").then(async (response) => {
        if (!response.ok) {
          const result = (await response.json()) as { error?: string };
          throw new Error(result.error ?? "No se pudo consultar la tasa BCV.");
        }
        return (await response.json()) as RateResponse;
      }),
    ])
      .then(([paymentConfig, officialRate]) => {
        setConfig(paymentConfig);
        setRate(officialRate);
      })
      .catch((error: unknown) => {
        console.error("No se pudo preparar el checkout venezolano.", error);
        setLoadError(
          error instanceof Error
            ? error.message
            : "No se pudo preparar el checkout. Inténtalo más tarde.",
        );
      });

    return () => window.clearInterval(timer);
  }, []);

  const lineItems = useMemo(
    () =>
      cartItems.flatMap((item) => {
        const product = products.find((candidate) => candidate.id === item.id);
        if (!product) return [];
        return [
          {
            ...item,
            product,
            priceUsd: config?.pricesUsd?.[product.id] ?? null,
          },
        ];
      }),
    [cartItems, config],
  );

  const subtotalUsd =
    lineItems.length > 0 && lineItems.every((item) => item.priceUsd !== null)
      ? lineItems.reduce(
          (total, item) => total + (item.priceUsd ?? 0) * item.quantity,
          0,
        )
      : null;
  const subtotalCents =
    subtotalUsd === null ? null : Math.round(subtotalUsd * 100);
  const shippingCents =
    config?.shippingUsd === null || config?.shippingUsd === undefined
      ? null
      : Math.round(config.shippingUsd * 100);
  const taxCents =
    subtotalCents === null ||
    shippingCents === null ||
    config?.taxRate === null ||
    config?.taxRate === undefined ||
    config.shippingUsd === null ||
    config.shippingUsd === undefined
      ? null
      : Math.round((subtotalCents + shippingCents) * config.taxRate);
  const payableCents =
    subtotalCents === null ||
    shippingCents === null ||
    taxCents === null
      ? null
      : subtotalCents + shippingCents + taxCents;
  const taxUsd = taxCents === null ? null : taxCents / 100;
  const payableUsd = payableCents === null ? null : payableCents / 100;
  const totalVes = rate
    ? payableCents === null
      ? null
      : Math.round(payableCents * rate.rate) / 100
    : null;
  const canSubmit =
    cartItems.length > 0 &&
    config?.pricesConfigured === true &&
    config.feesConfirmed &&
    config.databaseConfigured &&
    config.emailConfigured &&
    payableUsd !== null &&
    config.paymentMobile !== null &&
    rate !== null &&
    rate.expiresAt > now &&
    !submitting;

  async function submitPaymentReport(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!canSubmit) return;
    setSubmitting(true);
    setFormError("");

    const formData = new FormData(event.currentTarget);
    const requestBody = {
      items: cartItems,
      customerEmail: formData.get("email"),
      payerName: formData.get("payerName"),
      payerId: formData.get("payerId"),
      payerPhone: formData.get("payerPhone"),
      payerBank: formData.get("payerBank"),
      reference: formData.get("reference"),
      rateQuote: rate?.token,
    };

    try {
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });
      const result = (await response.json()) as CreatedOrder | { error?: string };
      if (!response.ok || !("orderNumber" in result)) {
        throw new Error(
          "error" in result && result.error
            ? result.error
            : "No pudimos registrar el reporte de pago.",
        );
      }

      setOrder(result);
      localStorage.removeItem("lumina_cart");
      setCartItems([]);
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : "No se pudo registrar el pago. Revisa tu conexión e inténtalo nuevamente.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="checkout-wrap">
      <Link className="checkout-back" href="/#productos">
        ← Volver a la tienda
      </Link>
      <p className="section-kicker">Pago Móvil · Venezuela</p>
      <h1 className="section-title">Finaliza tu pedido</h1>
      <p className="checkout-intro">
        Los precios se configuran en USD. El equivalente en bolívares se calcula
        usando la tasa oficial publicada por el BCV.
      </p>

      {order ? (
        <section className="checkout-confirmation" aria-live="polite">
          <h2>Reporte recibido</h2>
          <p>
            Pedido <strong>{order.orderNumber}</strong>:{" "}
            <strong>Pendiente de verificación</strong>.
          </p>
          <p>
            Total reportado: {formatCurrency(Number(order.totalUsd), "USD")} ·{" "}
            {formatCurrency(Number(order.totalVes), "VES")}
          </p>
          <p>
            Tasa BCV consultada el {order.bcvRateDate}:{" "}
            {formatCurrency(order.bcvRate, "VES")} por USD.
          </p>
          <p>
            Transfiere al banco {order.receiver.bank}, teléfono{" "}
            {order.receiver.phone}, cédula/RIF {order.receiver.id}, titular{" "}
            {order.receiver.owner}.
          </p>
          <p>
            {order.emailSent
              ? "Enviamos la confirmación al correo indicado."
              : "El pedido quedó registrado, pero el correo de confirmación no pudo enviarse. Contacta a soporte con tu número de pedido."}
          </p>
          <Link className="button-primary" href="/">
            Volver al inicio
          </Link>
        </section>
      ) : (
        <div className="checkout-layout">
          <section className="checkout-summary" aria-labelledby="summary-title">
            <h2 id="summary-title">Resumen de compra</h2>
            {lineItems.length === 0 ? (
              <p>
                Tu carrito está vacío.{" "}
                <Link href="/colecciones">Explora el catálogo.</Link>
              </p>
            ) : (
              <ul>
                {lineItems.map(({ id, product, quantity, priceUsd }) => (
                  <li key={id}>
                    <span>{product.name} × {quantity}</span>
                    <strong>
                      {priceUsd === null
                        ? "Precio por configurar"
                        : formatCurrency(priceUsd * quantity, "USD")}
                    </strong>
                  </li>
                ))}
              </ul>
            )}
            <div className="checkout-total">
              <span>Subtotal de productos</span>
              <strong>
                {subtotalUsd === null
                  ? "Por configurar"
                  : formatCurrency(subtotalUsd, "USD")}
              </strong>
            </div>
            <div className="checkout-total">
              <span>Envío</span>
              <strong>
                {config?.shippingUsd === null || config?.shippingUsd === undefined
                  ? "Por configurar"
                  : formatCurrency(config.shippingUsd, "USD")}
              </strong>
            </div>
            <div className="checkout-total">
              <span>Impuestos configurados</span>
              <strong>
                {taxUsd === null
                  ? "Por configurar"
                  : formatCurrency(taxUsd, "USD")}
              </strong>
            </div>
            <div className="checkout-total checkout-grand-total">
              <span>Total USD</span>
              <strong>
                {payableUsd === null
                  ? "Por configurar"
                  : formatCurrency(payableUsd, "USD")}
              </strong>
            </div>
            <div className="checkout-total">
              <span>Equivalente en VES</span>
              <strong>
                {totalVes === null
                  ? "Consultando BCV…"
                  : formatCurrency(totalVes, "VES")}
              </strong>
            </div>
            {rate && (
              <p className="checkout-rate-note">
                Tasa BCV consultada el {rate.rateDate}: {rate.rate.toFixed(6)} VES/USD.
                La cotización es válida hasta{" "}
                {new Date(rate.expiresAt).toLocaleTimeString("es-VE", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: "America/Caracas",
                })}{" "}
                (hora de Venezuela); el servidor usará esta misma tasa.
              </p>
            )}
            {rate && rate.expiresAt <= now && (
              <button
                className="cookie-button"
                type="button"
                onClick={async () => {
                  setLoadError("");
                  try {
                    const response = await fetch("/api/exchange-rate");
                    const result = (await response.json()) as RateResponse | { error?: string };
                    if (!response.ok || !("token" in result)) {
                      throw new Error("error" in result && result.error
                        ? result.error
                        : "No se pudo actualizar la tasa.");
                    }
                    setRate(result);
                  } catch (error) {
                    setLoadError(error instanceof Error ? error.message : "No se pudo actualizar la tasa.");
                  }
                }}
              >
                Actualizar tasa BCV
              </button>
            )}
            {config?.paymentMobile ? (
              <div className="payment-instructions">
                <h3>Datos para Pago Móvil</h3>
                <p>Banco: {config.paymentMobile.bank}</p>
                <p>Teléfono: {config.paymentMobile.phone}</p>
                <p>Cédula/RIF: {config.paymentMobile.id}</p>
                <p>Titular: {config.paymentMobile.owner}</p>
                <p>
                  Este checkout solo registra tu referencia; no se conecta a
                  C2P ni confirma automáticamente el abono.
                </p>
              </div>
            ) : (
              <p className="checkout-config-warning">
                Pago Móvil no está configurado. Faltan los datos receptores del
                comercio.
              </p>
            )}
          </section>

          <form className="checkout-form" onSubmit={submitPaymentReport}>
            <h2>Reportar transferencia</h2>
            <p>Realiza primero el Pago Móvil y luego registra los datos de la operación.</p>
            <label>
              Correo para la confirmación
              <input name="email" type="email" autoComplete="email" required />
            </label>
            <label>
              Nombre del titular que pagó
              <input name="payerName" autoComplete="name" minLength={2} maxLength={100} required />
            </label>
            <label>
              Cédula/RIF del pagador
              <input
                name="payerId"
                placeholder="V12345678"
                pattern="[VEJPGvejpg]-?[0-9]{6,10}"
                title="Usa una letra V, E, J, G o P seguida de 6 a 10 números."
                required
              />
            </label>
            <label>
              Teléfono asociado al Pago Móvil
              <input
                name="payerPhone"
                type="tel"
                autoComplete="tel"
                placeholder="04121234567 o +584121234567"
                pattern="(\+?58)?0?4(12|14|16|24|26)[0-9]{7}"
                title="Introduce un número móvil venezolano válido."
                required
              />
            </label>
            <label>
              Banco desde el que pagaste
              <input name="payerBank" autoComplete="organization" maxLength={100} required />
            </label>
            <label>
              Número de referencia
              <input
                name="reference"
                inputMode="numeric"
                minLength={4}
                maxLength={24}
                pattern="[a-zA-Z0-9-]{4,24}"
                required
              />
            </label>
            {loadError && <p className="checkout-error" role="alert">{loadError}</p>}
            {formError && <p className="checkout-error" role="alert">{formError}</p>}
            {config && !config.pricesConfigured && (
              <p className="checkout-config-warning">
                El checkout está desactivado hasta configurar precios reales USD
                para todos los productos. Los precios previos en CLP no se
                convertirán automáticamente.
              </p>
            )}
            {config && !config.feesConfirmed && (
              <p className="checkout-config-warning">
                El checkout seguirá desactivado hasta configurar y confirmar los
                costos reales de envío e impuestos aplicables.
              </p>
            )}
            {config && !config.databaseConfigured && (
              <p className="checkout-config-warning">
                El checkout seguirá desactivado hasta conectar PostgreSQL y
                aplicar la migración.
              </p>
            )}
            {config && !config.emailConfigured && (
              <p className="checkout-config-warning">
                El checkout seguirá desactivado hasta configurar el SMTP de
                confirmación para el cliente y la tienda.
              </p>
            )}
            <button className="button-primary" type="submit" disabled={!canSubmit}>
              {submitting ? "Enviando reporte…" : "Reportar pago y crear pedido"}
            </button>
            <p className="checkout-security-note">
              Los datos del pagador se cifran antes de guardarse. No envíes
              claves bancarias ni datos de tarjetas.
            </p>
          </form>
        </div>
      )}
    </div>
  );
}
