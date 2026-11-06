import { createHmac, timingSafeEqual } from "node:crypto";

const BCV_URL = "https://www.bcv.org.ve/";
const QUOTE_LIFETIME_MS = 15 * 60 * 1000;

export type BcvRate = {
  rate: number;
  rateDate: string;
  source: typeof BCV_URL;
};

export type BcvQuote = BcvRate & {
  issuedAt: number;
  expiresAt: number;
};

function getQuoteKey() {
  const key = process.env.BCV_QUOTE_SIGNING_KEY;
  if (!key || key.length < 32) {
    throw new Error("BCV_QUOTE_SIGNING_KEY debe tener al menos 32 caracteres aleatorios.");
  }
  return key;
}

export function parseBcvRate(html: string) {
  const dollarSectionStart = html.search(/id=["']dolar["']/i);
  if (dollarSectionStart < 0) return null;

  const dollarSection = html.slice(dollarSectionStart, dollarSectionStart + 5000);
  const match = dollarSection.match(
    /<strong\b[^>]*>\s*([\d.,]+)\s*<\/strong>/i,
  );
  if (!match) return null;

  const rawValue = match[1];
  const value = rawValue.includes(",")
    ? rawValue.replace(/\./g, "").replace(",", ".")
    : rawValue;
  const rate = Number(value);
  return Number.isFinite(rate) && rate > 0 ? rate : null;
}

export async function getBcvRate(): Promise<BcvRate> {
  const response = await fetch(BCV_URL, {
    headers: { "User-Agent": "LuminaTechStore/1.0 (BCV rate lookup)" },
    cache: "no-store",
    signal: AbortSignal.timeout(8000),
  });
  if (!response.ok) {
    throw new Error(`El BCV respondió con el estado ${response.status}.`);
  }

  const rate = parseBcvRate(await response.text());
  if (rate === null) {
    throw new Error("No se pudo identificar la tasa USD/VES publicada por el BCV.");
  }

  const dateParts = new Intl.DateTimeFormat("en-CA", {
    timeZone: "America/Caracas",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const date = Object.fromEntries(dateParts.map(({ type, value }) => [type, value]));

  return {
    rate: Number(rate.toFixed(6)),
    rateDate: `${date.year}-${date.month}-${date.day}`,
    source: BCV_URL,
  };
}

export function usdCentsToVesCents(usdCents: number, rate: number) {
  return Math.round(usdCents * rate);
}

export function createBcvQuote(rate: BcvRate) {
  const issuedAt = Date.now();
  const quote: BcvQuote = {
    ...rate,
    issuedAt,
    expiresAt: issuedAt + QUOTE_LIFETIME_MS,
  };
  const payload = Buffer.from(JSON.stringify(quote)).toString("base64url");
  const signature = createHmac("sha256", getQuoteKey())
    .update(payload)
    .digest("base64url");
  return { ...quote, token: `${payload}.${signature}` };
}

export function verifyBcvQuote(token: string): BcvQuote | null {
  const [payload, signature, extra] = token.split(".");
  if (!payload || !signature || extra) return null;

  const expected = createHmac("sha256", getQuoteKey())
    .update(payload)
    .digest();
  const actual = Buffer.from(signature, "base64url");
  if (actual.length !== expected.length || !timingSafeEqual(actual, expected)) {
    return null;
  }

  let quote: unknown;
  try {
    quote = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
  } catch {
    return null;
  }
  if (
    typeof quote !== "object" ||
    quote === null ||
    !("rate" in quote) ||
    typeof quote.rate !== "number" ||
    !Number.isFinite(quote.rate) ||
    quote.rate <= 0 ||
    !("rateDate" in quote) ||
    typeof quote.rateDate !== "string" ||
    !("source" in quote) ||
    quote.source !== BCV_URL ||
    !("issuedAt" in quote) ||
    typeof quote.issuedAt !== "number" ||
    !("expiresAt" in quote) ||
    typeof quote.expiresAt !== "number"
  ) {
    return null;
  }

  const now = Date.now();
  if (
    quote.issuedAt > now + 30_000 ||
    quote.expiresAt <= now ||
    quote.expiresAt - quote.issuedAt > QUOTE_LIFETIME_MS
  ) {
    return null;
  }
  return quote as BcvQuote;
}
