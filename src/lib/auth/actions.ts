"use server";

import { APIError } from "better-auth/api";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { auth } from "./auth";
import {
  authErrorMessage,
  fieldErrorsOf,
  formValues,
  signInSchema,
  signUpSchema,
  type FormState,
} from "./forms";

const verifiedRedirect = "/login?verified=1";

export async function signIn(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["identifier"]);
  const parsed = signInSchema.safeParse({ ...values, ...formValues(formData, ["password"]) });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { identifier, password } = parsed.data;
  try {
    const requestHeaders = await headers();
    if (identifier.includes("@")) {
      await auth.api.signInEmail({ body: { email: identifier, password, callbackURL: verifiedRedirect }, headers: requestHeaders });
    } else {
      await auth.api.signInUsername({
        body: { username: identifier, password, callbackURL: verifiedRedirect },
        headers: requestHeaders,
      });
    }
  } catch (error) {
    // Unexpected failures (e.g. database outages) go to the error boundary.
    if (!(error instanceof APIError)) throw error;
    return { values, error: authErrorMessage(error.body?.code) };
  }
  redirect("/");
}

export async function signUp(_prev: FormState, formData: FormData): Promise<FormState> {
  const values = formValues(formData, ["username", "email", "province", "usageProfile"]);
  const parsed = signUpSchema.safeParse({ ...values, ...formValues(formData, ["password"]) });
  if (!parsed.success) return { values, fieldErrors: fieldErrorsOf(parsed.error) };

  const { username, email, password, province, usageProfile } = parsed.data;
  try {
    await auth.api.signUpEmail({
      body: {
        name: username,
        username,
        email,
        password,
        province,
        usageProfile,
        callbackURL: verifiedRedirect,
      },
      headers: await headers(),
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
