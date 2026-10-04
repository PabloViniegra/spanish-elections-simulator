import { expect, test } from "@playwright/test";

test("login page shows the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Iniciar sesión · Simulador de Elecciones");
  await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
  await expect(page.getByLabel("Usuario o correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("register page shows every profile field", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { level: 1, name: "Crea tu cuenta" })).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Provincia (opcional)").locator("option")).toHaveCount(53);
  await expect(page.getByLabel("Perfil de uso")).toHaveValue("citizen");
});

test("login and register link to each other", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("link", { name: "Crea una" }).click();
  await expect(page).toHaveURL(/\/register$/);
  await page.getByRole("link", { name: "Inicia sesión" }).click();
  await expect(page).toHaveURL(/\/login$/);
});

test("register keeps submitted values when the server rejects them", async ({ page }) => {
  await page.goto("/register");
  // Skip browser validation so the server action (zod) handles the input.
  await page.locator("form").evaluate((form: HTMLFormElement) => {
    form.noValidate = true;
  });
  await page.getByLabel("Nombre de usuario").fill("ab");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByLabel("Contraseña").fill("contraseña-segura");
  await page.getByLabel("Provincia (opcional)").selectOption("28");
  await page.getByLabel("Perfil de uso").selectOption("teacher");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("El usuario debe tener al menos 3 caracteres.")).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Correo electrónico")).toHaveValue("ana@example.com");
  await expect(page.getByLabel("Provincia (opcional)")).toHaveValue("28");
  await expect(page.getByLabel("Perfil de uso")).toHaveValue("teacher");
});
