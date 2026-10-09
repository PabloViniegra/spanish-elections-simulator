import { APIError } from "better-auth/api";
import { type Consume, firstBlocked, type Limit, tooManyAttempts } from "@/lib/rate-limit/rules";
import { authErrorMessage, type FormState } from "./forms";

// Runs `call` unless one of `limits` is exhausted; no form state means it succeeded.
// Server actions call Better Auth directly, past its per-request rate limit,
// so the limits are counted here. Expected rejections become form errors;
// anything else (e.g. a database outage) goes to the error boundary.
export async function attemptAuth(
  values: Record<string, string>,
  limits: readonly Limit[],
  consume: Consume,
  call: () => Promise<void>,
): Promise<FormState> {
  const blocked = await firstBlocked(limits, consume);
  if (blocked !== null) return { values, error: tooManyAttempts(blocked) };
  try {
    await call();
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return { values, error: authErrorMessage(error.body?.code) };
  }
  return undefined;
}
