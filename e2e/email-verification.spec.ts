import { expect, test } from "@playwright/test";
import { createEmailVerificationToken } from "better-auth/api";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { user } from "../src/lib/db/schema";
import { AUTH_SECRET } from "./account";

test("email verification rejects invalid tokens and enables sign-in with a valid token", async ({ page, request }) => {
  await page.setExtraHTTPHeaders({ "x-real-ip": `10.${crypto.getRandomValues(new Uint8Array(3)).join(".")}` });
  const id = crypto.randomUUID().slice(0, 8);
  const email = `verify-${id}@example.com`;
  const password = "contraseña-verificacion";
  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(`verify_${id}`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email/);

  const verified = async () => (await db.select({ verified: user.emailVerified }).from(user).where(eq(user.email, email)))[0]?.verified;
  expect(await verified()).toBe(false);
  await page.goto("/login?next=%2Fprofile");
  await page.getByLabel("Usuario o correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
  await expect(page.getByRole("alert").filter({ hasText: "Confirma tu correo" })).toBeVisible();
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);

  // A locally signed fixture exercises the real endpoint, without sending email.
  const callback = "/login?verified=1&next=%2Fprofile";
  const token = await createEmailVerificationToken(AUTH_SECRET, email);
  const wrongSignature = await createEmailVerificationToken("different-test-secret", email);
  const expired = await createEmailVerificationToken(AUTH_SECRET, email, undefined, -60);
  for (const invalid of [wrongSignature, expired]) {
    const response = await request.get(`/api/auth/verify-email?token=${invalid}&callbackURL=${encodeURIComponent(callback)}`, { maxRedirects: 0 });
    expect(response.headers().location).toContain("error=");
    expect(await verified()).toBe(false);
  }
  await page.goto(`/api/auth/verify-email?token=${token}&callbackURL=${encodeURIComponent(callback)}`);
  expect(await verified()).toBe(true);
  await expect(page).toHaveURL(/\/login\?verified=1&next=%2Fprofile$/);
  await page.getByLabel("Usuario o correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/profile$/);
});
