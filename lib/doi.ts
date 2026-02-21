import { createHash, randomBytes } from "crypto";

const TOKEN_BYTES = 32;
const EXPIRY_HOURS = 24;

export function generateDoiToken(): { raw: string; hash: string } {
  const raw = randomBytes(TOKEN_BYTES).toString("base64url");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export function hashDoiToken(raw: string): string {
  return createHash("sha256").update(raw).digest("hex");
}

export function getDoiExpiry(): Date {
  const d = new Date();
  d.setHours(d.getHours() + EXPIRY_HOURS);
  return d;
}
