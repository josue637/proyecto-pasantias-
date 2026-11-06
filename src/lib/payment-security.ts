import {
  createCipheriv,
  createDecipheriv,
  createHmac,
  randomBytes,
} from "node:crypto";

function getEncryptionKey() {
  const encoded = process.env.PAYMENT_DATA_ENCRYPTION_KEY;
  if (!encoded) {
    throw new Error("PAYMENT_DATA_ENCRYPTION_KEY no está configurada.");
  }

  const key = Buffer.from(encoded, "base64");
  if (key.length !== 32) {
    throw new Error("PAYMENT_DATA_ENCRYPTION_KEY debe contener 32 bytes en base64.");
  }
  return key;
}

export function encryptPaymentDetails(details: object) {
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", getEncryptionKey(), iv);
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(details), "utf8"),
    cipher.final(),
  ]);
  const tag = cipher.getAuthTag();
  return [
    "v1",
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function fingerprintPaymentReference(reference: string) {
  return createHmac("sha256", getEncryptionKey())
    .update(reference.trim().toUpperCase())
    .digest("hex");
}

export function decryptPaymentDetails<T>(value: string): T {
  const [version, encodedIv, encodedTag, encodedData] = value.split(".");
  if (
    version !== "v1" ||
    !encodedIv ||
    !encodedTag ||
    !encodedData
  ) {
    throw new Error("El formato de los datos de pago cifrados no es válido.");
  }

  const decipher = createDecipheriv(
    "aes-256-gcm",
    getEncryptionKey(),
    Buffer.from(encodedIv, "base64url"),
  );
  decipher.setAuthTag(Buffer.from(encodedTag, "base64url"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encodedData, "base64url")),
    decipher.final(),
  ]);
  return JSON.parse(decrypted.toString("utf8")) as T;
}
