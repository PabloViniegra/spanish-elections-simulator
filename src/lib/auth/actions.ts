"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, signInRules, signUpRules, tooManyAttempts } from "@/lib/rate-limit/rules";
import { firstBlocked } from "@/lib/rate-limit/store";
import { auth } from "./auth";
import { safeNextPath, withNext } from "./next-path";
import {
  authErrorMessage,
  fieldErrorsOf,
  formValues,
  signInSchema,
  signUpSchema,
  type FormState,
} from "./forms";

// The confirmation link lands on the login page, which then goes on to `next`.
const verifiedRedirect = (next: string) => withNext("/login?verified=1", next);

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["identifier"]);
  const parsed = signInSchema.safeParse({ ...values, ...formValues(formData, ["password"]) });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { identifier, password } = parsed.data;
  const next = safeNextPath(formValues(formData, ["next"]).next);
  const callbackURL = verifiedRedirect(next);
  const requestHeaders = await headers();
  // Server actions call Better Auth directly, past its per-request rate limit.
  const blocked = await firstBlocked([
    [`sign-in|ip|${clientIp(requestHeaders)}`, signInRules.ip],
    [`sign-in|account|${identifier.toLowerCase()}`, signInRules.account],
  ]);
  if (blocked !== null) return { values, error: tooManyAttempts(blocked) };
  try {
    if (identifier.includes("@")) {
      await auth.api.signInEmail({ body: { email: identifier, password, callbackURL }, headers: requestHeaders });
    } else {
      await auth.api.signInUsername({
        body: { username: identifier, password, callbackURL },
        headers: requestHeaders,
      });
    }
  } catch (error) {
    // Unexpected failures (e.g. database outages) go to the error boundary.
    if (!(error instanceof APIError)) throw error;
    return { values, error: authErrorMessage(error.body?.code) };
  }
  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["username", "email", "province", "usageProfile"]);
  const parsed = signUpSchema.safeParse({ ...values, ...formValues(formData, ["password"]) });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { username, email, password, province, usageProfile } = parsed.data;
  const requestHeaders = await headers();
  const blocked = await firstBlocked([
    [`sign-up|ip|${clientIp(requestHeaders)}`, signUpRules.ip],
    [`sign-up|email|${email.toLowerCase()}`, signUpRules.email],
  ]);
  if (blocked !== null) return { values, error: tooManyAttempts(blocked) };
  try {
    await auth.api.signUpEmail({
      body: {
        name: username,
        username,
        email,
        password,
        province,
        usageProfile,
        callbackURL: verifiedRedirect(safeNextPath(formValues(formData, ["next"]).next)),
      },
      headers: requestHeaders,
    });
  } catch (error) {
    if (!(error instanceof APIError)) throw error;
    return { values, error: authErrorMessage(error.body?.code) };
  }
  redirect(`/register/check-email?email=${encodeURIComponent(email)}`);
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
