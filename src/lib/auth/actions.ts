"use server";

import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { clientIp, deleteAccountLimits, newPasswordLimits, passwordResetLimits, signInLimits, signUpLimits } from "@/lib/rate-limit/rules";
import { consume } from "@/lib/rate-limit/store";
import { attemptAuth } from "./attempt";
import { auth } from "./auth";
import { safeNextPath, withNext } from "./next-path";
import {
  deleteAccountSchema,
  fieldErrorsOf,
  formValues,
  requestPasswordResetSchema,
  resetPasswordSchema,
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

// Unknown addresses get the same answer, so the form does not reveal accounts.
export async function requestPasswordReset(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["email"]);
  const parsed = requestPasswordResetSchema.safeParse(values);
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { email } = parsed.data;
  const requestHeaders = await headers();
  const failure = await attemptAuth(values, passwordResetLimits(clientIp(requestHeaders), email), consume, async () => {
    // The emailed link checks the token, then lands on this page with it.
    await auth.api.requestPasswordReset({ body: { email, redirectTo: "/reset-password" }, headers: requestHeaders });
  });
  if (failure) return failure;
  redirect("/forgot-password?sent=1");
}

export async function resetPassword(_prev: FormState, formData: FormData): Promise<FormState> {
  const parsed = resetPasswordSchema.safeParse(formValues(formData, ["token", "password"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const { token, password } = parsed.data;
  const requestHeaders = await headers();
  const failure = await attemptAuth({}, newPasswordLimits(clientIp(requestHeaders)), consume, async () => {
    await auth.api.resetPassword({ body: { token, newPassword: password }, headers: requestHeaders });
  });
  if (failure) return failure;
  redirect("/login?reset=1");
}

export async function signOut() {
  await auth.api.signOut({ headers: await headers() });
  redirect("/");
}

// Removes the account, its sessions and (by cascade) its saved simulations.
export async function deleteAccount(_prev: FormState, formData: FormData): Promise<FormState> {
  const requestHeaders = await headers();
  const session = await auth.api.getSession({ headers: requestHeaders });
  if (!session) redirect("/login");
  const parsed = deleteAccountSchema.safeParse(formValues(formData, ["password"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  const failure = await attemptAuth({}, deleteAccountLimits(session.user.id), consume, async () => {
    await auth.api.deleteUser({ body: { password: parsed.data.password }, headers: requestHeaders });
  });
  if (failure) return failure;
  // The home page confirms it with a toast.
  redirect("/?account-deleted=1");
}
