// At most `max` attempts per `window` seconds.
export type RateRule = { window: number; max: number };
export type Limit = readonly [key: string, rule: RateRule];
// Counts one attempt against `key`; `retryAfter` is null while it is allowed.
export type Consume = (key: string, rule: RateRule) => Promise<{ retryAfter: number | null }>;

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

// Keys are lower-cased so changing the case does not open a fresh bucket.
export function signInLimits(ip: string, identifier: string): Limit[] {
  return [
    [`sign-in|ip|${ip}`, signInRules.ip],
    [`sign-in|account|${identifier.toLowerCase()}`, signInRules.account],
  ];
}

export function signUpLimits(ip: string, email: string): Limit[] {
  return [
    [`sign-up|ip|${ip}`, signUpRules.ip],
    [`sign-up|email|${email.toLowerCase()}`, signUpRules.email],
  ];
}

// Each request may send an email, so it is as scarce as signing up.
export function passwordResetLimits(ip: string, email: string): Limit[] {
  return [
    [`password-reset|ip|${ip}`, signUpRules.ip],
    [`password-reset|email|${email.toLowerCase()}`, signUpRules.email],
  ];
}

// Guessing a reset token is hopeless, but each attempt still hashes a password.
export function newPasswordLimits(ip: string): Limit[] {
  return [[`new-password|ip|${ip}`, signInRules.ip]];
}

// The password check before deleting an account is another chance to guess it.
export function deleteAccountLimits(userId: string): Limit[] {
  return [[`delete-account|user|${userId}`, signInRules.account]];
}

// Seconds until the first exhausted limit frees up, or null when all allow the
// attempt. Later limits are not counted once one blocks.
export async function firstBlocked(limits: readonly Limit[], consume: Consume) {
  for (const [key, rule] of limits) {
    const { retryAfter } = await consume(key, rule);
    if (retryAfter !== null) return retryAfter;
  }
  return null;
}
