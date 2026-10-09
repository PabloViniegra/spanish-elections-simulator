import { expect, test as setup } from "@playwright/test";
import { ACCOUNT, SIGNED_IN } from "./account";
import { confirmEmail, resetDatabase } from "./db";

setup("registers, confirms the email and signs in", async ({ page }) => {
  await resetDatabase();

  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(ACCOUNT.username);
  await page.getByLabel("Correo electrónico").fill(ACCOUNT.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(ACCOUNT.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email\?email=e2e%40example\.com$/);

  await confirmEmail(ACCOUNT.email);
  await page.goto("/login?next=%2Fsimulator");
  await page.getByLabel("Usuario o correo electrónico").fill(ACCOUNT.username);
  await page.getByLabel("Contraseña", { exact: true }).fill(ACCOUNT.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/simulator$/);

  await page.context().storageState({ path: SIGNED_IN });
});
