import { APIError } from "better-auth/api";
import { type Consume, firstBlocked, type Limit, tooManyAttempts } from "@/lib/rate-limit/rules";
import { serverFailure } from "@/lib/server-error";
import { authErrorMessage, type FormState } from "./forms";

// Runs `call` unless one of `limits` is exhausted; no form state means it succeeded.
// Server actions call Better Auth directly, past its per-request rate limit,
// so the limits are counted here. Expected rejections become form errors, and
// so does anything else (e.g. a database outage), with a generic message.
export async function attemptAuth(
  values: Record<string, string>,
  limits: readonly Limit[],
  consume: Consume,
  call: () => Promise<void>,
): Promise<FormState> {
  try {
    const blocked = await firstBlocked(limits, consume);
    if (blocked !== null) return { values, error: tooManyAttempts(blocked) };
    await call();
  } catch (error) {
    if (error instanceof APIError) return { values, error: authErrorMessage(error.body?.code) };
    if (error instanceof Error) return { values, ...serverFailure(error) };
    throw error;
  }
  return undefined;
}
