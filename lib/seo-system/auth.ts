import "server-only";

import { createHmac, timingSafeEqual } from "crypto";

export const ADMIN_COOKIE = "ka_seo_admin";

const LOT_PIN = "2180";

export function adminSecret(): string | null {
  const secret = process.env.SEO_ADMIN_SECRET?.trim();
  return secret || null;
}

/** Cookie signing key. The footer PIN works even when no env secret is set. */
export function signingSecret(): string {
  return adminSecret() || LOT_PIN;
}

export function cronAuthorized(request: Request): boolean {
  const header = request.headers.get("authorization") || "";
  const token = header.replace(/^Bearer\s+/i, "");
  const cron = process.env.CRON_SECRET?.trim();
  const admin = adminSecret();
  if (cron && safeEqual(token, cron)) return true;
  if (admin && safeEqual(token, admin)) return true;
  return false;
}

export function adminToken(secret: string): string {
  return createHmac("sha256", secret).update("king-auto-seo-admin").digest("hex");
}

export function passwordMatches(given: string): boolean {
  const pin = given.trim();
  if (safeEqual(pin, LOT_PIN)) return true;
  const secret = adminSecret();
  if (secret && safeEqual(pin, secret)) return true;
  return false;
}

export function cookieIsAdmin(cookieValue: string | undefined): boolean {
  if (!cookieValue) return false;
  return safeEqual(cookieValue, adminToken(signingSecret()));
}

export function requestIsAdmin(request: Request): boolean {
  const raw = request.headers.get("cookie") || "";
  let value: string | undefined;
  for (const part of raw.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key === ADMIN_COOKIE) value = decodeURIComponent(rest.join("="));
  }
  return cookieIsAdmin(value);
}

function safeEqual(a: string, b: string): boolean {
  const left = Buffer.from(a);
  const right = Buffer.from(b);
  if (left.length !== right.length) return false;
  return timingSafeEqual(left, right);
}
