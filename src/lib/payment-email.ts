import nodemailer from "nodemailer";

type PaymentEmailDetails = {
  orderNumber: string;
  customerEmail: string;
  totalUsd: string;
  totalVes: string;
  rate: string;
};

export function isPaymentEmailConfigured() {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASSWORD &&
      process.env.SMTP_FROM &&
      process.env.PAYMENT_REVIEW_EMAIL,
  );
}

function createTransporter() {
  const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASSWORD } = process.env;
  if (!SMTP_HOST || !SMTP_PORT || !SMTP_USER || !SMTP_PASSWORD) return null;

  const port = Number(SMTP_PORT);
  if (!Number.isInteger(port) || port < 1 || port > 65535) {
    throw new Error("SMTP_PORT debe ser un puerto válido.");
  }

  return nodemailer.createTransport({
    host: SMTP_HOST,
    port,
    secure: port === 465,
    auth: { user: SMTP_USER, pass: SMTP_PASSWORD },
  });
}

export async function sendPaymentPendingEmail(details: PaymentEmailDetails) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM;
  const reviewEmail = process.env.PAYMENT_REVIEW_EMAIL;

  if (!transporter || !from || !reviewEmail) {
    return { customerSent: false, storeSent: false };
  }

  const subject = `Pago móvil pendiente de verificación - ${details.orderNumber}`;
  const text = [
    `Pedido: ${details.orderNumber}`,
    `Estado: Pendiente de verificación`,
    `Total: $${details.totalUsd} USD`,
    `Equivalente BCV: Bs. ${details.totalVes} VES`,
    `Tasa BCV usada: ${details.rate} VES/USD`,
    "El pago móvil será confirmado después de una revisión manual.",
  ].join("\n");

  const results = await Promise.allSettled([
    transporter.sendMail({
      from,
      to: details.customerEmail,
      subject: `Recibimos tu reporte de pago - ${details.orderNumber}`,
      text,
    }),
    transporter.sendMail({
      from,
      to: reviewEmail,
      subject,
      text: `${text}\n\nRevisa los datos cifrados desde la ruta de revisión protegida.`,
    }),
  ]);
  const [customerResult, storeResult] = results;
  if (customerResult.status === "rejected") {
    console.error("Falló el correo de confirmación al cliente.", customerResult.reason);
  }
  if (storeResult.status === "rejected") {
    console.error("Falló el aviso SMTP de revisión al comercio.", storeResult.reason);
  }

  return {
    customerSent:
      customerResult.status === "fulfilled" &&
      Boolean(customerResult.value.messageId),
    storeSent:
      storeResult.status === "fulfilled" && Boolean(storeResult.value.messageId),
  };
}

export async function sendPaymentVerifiedEmail(
  customerEmail: string,
  orderNumber: string,
) {
  const transporter = createTransporter();
  const from = process.env.SMTP_FROM;
  if (!transporter || !from) return false;

  const result = await transporter.sendMail({
    from,
    to: customerEmail,
    subject: `Pago confirmado - ${orderNumber}`,
    text: `Tu pago para el pedido ${orderNumber} fue verificado. Gracias por comprar en Lúmina.`,
  });
  return Boolean(result.messageId);
}
