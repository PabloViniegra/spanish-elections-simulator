import { expect, test } from "@playwright/test";
import { confirmEmail, passwordResetToken } from "./db";

// An account of its own, so changing its password does not sign out the shared one.
test("a forgotten password can be replaced through the emailed link", async ({ page }) => {
  const id = crypto.randomUUID().slice(0, 8);
  const account = { username: `olvido_${id}`, email: `olvido-${id}@example.com`, password: "contraseña-olvidada" };
  const newPassword = "contraseña-recuperada";

  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(account.username);
  await page.getByLabel("Correo electrónico").fill(account.email);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email/);
  await confirmEmail(account.email);

  await page.goto("/login");
  await page.getByRole("link", { name: "¿Has olvidado tu contraseña?" }).click();
  await expect(page).toHaveURL(/\/forgot-password$/);
  await page.getByLabel("Correo electrónico", { exact: true }).fill(account.email);
  await page.getByRole("button", { name: "Enviar enlace" }).click();
  await expect(page.getByText(/Si hay una cuenta con ese correo/)).toBeVisible();

  // The emailed link goes through Better Auth, which checks the token.
  const token = await passwordResetToken(account.email);
  await page.goto(`/api/auth/reset-password/${token}?callbackURL=%2Freset-password`);
  await expect(page).toHaveURL(/\/reset-password\?token=/);
  await page.getByLabel("Contraseña nueva").fill(newPassword);
  await page.getByRole("button", { name: "Cambiar contraseña" }).click();
  await expect(page.getByText("Contraseña cambiada. Inicia sesión con la nueva.")).toBeVisible();

  await page.getByLabel("Usuario o correo electrónico").fill(account.username);
  await page.getByLabel("Contraseña", { exact: true }).fill(account.password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Usuario, correo o contraseña incorrectos.")).toBeVisible();

  await page.getByLabel("Contraseña", { exact: true }).fill(newPassword);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);

  // The link works once.
  await page.goto(`/api/auth/reset-password/${token}?callbackURL=%2Freset-password`);
  await expect(page.getByText(/no es válido o ha caducado/)).toBeVisible();
});
