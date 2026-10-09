import { expect, test } from "@playwright/test";
import { confirmEmail } from "./db";

// An account of its own, so deleting it does not sign out the shared one.
test("deleting the account asks for the password and removes it", async ({ page }) => {
  const id = crypto.randomUUID().slice(0, 8);
  const account = { username: `borrar_${id}`, email: `borrar-${id}@example.com`, password: "contraseña-para-borrar" };

  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(account.username);
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email/);
  await confirmEmail(account.email);

  await page.goto("/login?next=%2Fprofile");
  await page.getByLabel("Usuario o correo electrónico").fill(account.username);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/profile$/);

  await page.getByRole("button", { name: "Eliminar mi cuenta" }).click();
  await page.getByLabel("Contraseña", { exact: true }).fill("no-es-la-contraseña");
  await page.getByRole("button", { name: "Eliminar mi cuenta" }).click();
  await expect(page.getByText("La contraseña no es correcta.")).toBeVisible();

  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Eliminar mi cuenta" }).click();
  await expect(page.getByText("Cuenta eliminada", { exact: true })).toBeVisible();
  await expect(page).toHaveURL(/\/$/);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);

  await page.getByLabel("Usuario o correo electrónico").fill(account.username);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Usuario, correo o contraseña incorrectos.")).toBeVisible();
});
