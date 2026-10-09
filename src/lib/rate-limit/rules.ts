import type { RateRule } from "./store";

// Per address, to slow down one client; per account, to slow down guessing a
// password or mailing someone from many addresses.
export const signInRules = {
  ip: { window: 60, max: 10 },
  account: { window: 15 * 60, max: 10 },
} satisfies Record<string, RateRule>;

export const signUpRules = {
  ip: { window: 60 * 60, max: 5 },
  email: { window: 60 * 60, max: 3 },
} satisfies Record<string, RateRule>;

// The client address set by the hosting proxy (Vercel sets x-real-ip), or one
// shared bucket when there is none.
export function clientIp(requestHeaders: Headers) {
  return requestHeaders.get("x-real-ip") || requestHeaders.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
}

export function tooManyAttempts(retryAfter: number) {
  const minutes = Math.ceil(retryAfter / 60);
  return `Demasiados intentos. Vuelve a probar dentro de ${minutes} ${minutes === 1 ? "minuto" : "minutos"}.`;
}
