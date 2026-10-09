"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, signInLimits, signUpLimits } from "@/lib/rate-limit/rules";
import { consume } from "@/lib/rate-limit/store";
import { attemptAuth } from "./attempt";
import { auth } from "./auth";
import { safeNextPath, withNext } from "./next-path";
import { fieldErrorsOf, formValues, signInSchema, signUpSchema, type FormState } from "./forms";

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
  const failure = await attemptAuth(values, signInLimits(clientIp(requestHeaders), identifier), consume, async () => {
    if (identifier.includes("@")) {
      await auth.api.signInEmail({ body: { email: identifier, password, callbackURL }, headers: requestHeaders });
    } else {
      await auth.api.signInUsername({ body: { username: identifier, password, callbackURL }, headers: requestHeaders });
    }
  });
  if (failure) return failure;
  redirect(next);
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["username", "email", "province", "usageProfile"]);
  const parsed = signUpSchema.safeParse({ ...values, ...formValues(formData, ["password"]) });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { username, email, password, province, usageProfile } = parsed.data;
  const requestHeaders = await headers();
  const callbackURL = verifiedRedirect(safeNextPath(formValues(formData, ["next"]).next));
  const failure = await attemptAuth(values, signUpLimits(clientIp(requestHeaders), email), consume, async () => {
    await auth.api.signUpEmail({
      body: { name: username, username, email, password, province, usageProfile, callbackURL },
      headers: requestHeaders,
    });
  });
  if (failure) return failure;
  redirect(`/register/check-email?email=${encodeURIComponent(email)}`);
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}
