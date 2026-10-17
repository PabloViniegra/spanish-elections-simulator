import { expect, test } from "@playwright/test";

test("login page shows the sign-in form", async ({ page }) => {
  await page.goto("/login");
  await expect(page).toHaveTitle("Iniciar sesión · Simulador de Elecciones");
  await expect(page.getByRole("heading", { level: 1, name: "Inicia sesión" })).toBeVisible();
  await expect(page.getByLabel("Usuario o correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña", { exact: true })).toHaveAttribute("type", "password");
  await expect(page.getByRole("button", { name: "Iniciar sesión" })).toBeVisible();
});

test("register page shows every profile field", async ({ page }) => {
  await page.goto("/register");
  await expect(page.getByRole("heading", { level: 1, name: "Crea tu cuenta" })).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toBeVisible();
  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Confirmar contraseña", { exact: true })).toHaveAttribute("type", "password");
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

test("register keeps entered values when validation rejects them", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill("ab");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("contraseña-segura");
  await page.getByLabel("Confirmar contraseña", { exact: true }).fill("contraseña-segura");
  await page.getByText("Añadir detalles (opcional)").click();
  await page.getByLabel("Provincia (opcional)").selectOption("28");
  await page.getByLabel("Perfil de uso").selectOption("teacher");
  await page.getByRole("button", { name: "Crear cuenta" }).click();

  await expect(page.getByText("El usuario debe tener al menos 3 caracteres.")).toBeVisible();
  await expect(page.getByLabel("Nombre de usuario")).toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Nombre de usuario")).toBeFocused();
  await expect(page.getByLabel("Correo electrónico")).toHaveValue("ana@example.com");
  await expect(page.getByLabel("Provincia (opcional)")).toHaveValue("28");
  await expect(page.getByLabel("Perfil de uso")).toHaveValue("teacher");
});

test("register validates fields while typing and clears corrected errors", async ({ page }) => {
  await page.goto("/register");
  const username = page.getByLabel("Nombre de usuario");
  const email = page.getByLabel("Correo electrónico");
  const password = page.getByLabel("Contraseña", { exact: true });
  await expect(page.locator('[aria-invalid="true"]')).toHaveCount(0);

  await username.fill("ab");
  await expect(page.getByText("El usuario debe tener al menos 3 caracteres.")).toBeVisible();
  await username.fill("ana.garcia");
  await expect(username).not.toHaveAttribute("aria-invalid", "true");
  await email.fill("ana");
  await expect(page.getByText("Introduce un correo electrónico válido.")).toBeVisible();
  await email.fill("ana@example.com");
  await expect(email).not.toHaveAttribute("aria-invalid", "true");
  await password.fill("corta");
  await expect(page.getByText("La contraseña debe tener al menos 8 caracteres.")).toBeVisible();
  await password.fill("contraseña-segura");
  await expect(password).not.toHaveAttribute("aria-invalid", "true");
  await expect(page.getByLabel("Confirmar contraseña", { exact: true })).not.toHaveAttribute("aria-invalid", "true");
});

test("register revalidates confirmation when either password changes", async ({ page }) => {
  await page.goto("/register");
  const password = page.getByLabel("Contraseña", { exact: true });
  const confirmation = page.getByLabel("Confirmar contraseña", { exact: true });
  await password.fill("contraseña-segura");
  await confirmation.fill("contraseña-distinta");
  await expect(page.getByText("Las contraseñas no coinciden.")).toBeVisible();
  await confirmation.fill("contraseña-segura");
  await expect(confirmation).not.toHaveAttribute("aria-invalid", "true");
  await password.fill("otra-contraseña-segura");
  await expect(confirmation).toHaveAttribute("aria-invalid", "true");
  await confirmation.fill("otra-contraseña-segura");
  await expect(page.getByText("Las contraseñas no coinciden.")).toHaveCount(0);
});

test("register requires confirmation and focuses it on submit", async ({ page }) => {
  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill("ana.garcia");
  await page.getByLabel("Correo electrónico").fill("ana@example.com");
  await page.getByLabel("Contraseña", { exact: true }).fill("contraseña-segura");
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page.getByText("Confirma tu contraseña.")).toBeVisible();
  await expect(page.getByLabel("Confirmar contraseña", { exact: true })).toBeFocused();
  await expect(page).toHaveURL(/\/register$/);
});

test("register supports keyboard navigation and independent password visibility", async ({ page }) => {
  await page.goto("/register");
  const password = page.getByLabel("Contraseña", { exact: true });
  const confirmation = page.getByLabel("Confirmar contraseña", { exact: true });
  await page.getByLabel("Nombre de usuario").focus();
  await page.keyboard.press("Tab");
  await expect(page.getByLabel("Correo electrónico")).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(password).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(password).toHaveAttribute("type", "text");
  await expect(confirmation).toHaveAttribute("type", "password");
  await page.keyboard.press("Tab");
  await expect(confirmation).toBeFocused();
  await page.keyboard.press("Tab");
  await page.keyboard.press("Enter");
  await expect(confirmation).toHaveAttribute("type", "text");
});

test("register reflows at narrow viewport widths", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 800 });
  await page.goto("/register");
  await expect(page.getByLabel("Confirmar contraseña", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Crear cuenta" })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
});

test("password can be revealed and hidden", async ({ page }) => {
  await page.goto("/login");
  const password = page.getByLabel("Contraseña", { exact: true });
  await page.getByRole("button", { name: "Mostrar" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByRole("button", { name: "Ocultar" }).click();
  await expect(password).toHaveAttribute("type", "password");
});

test("empty login submit shows Spanish errors and focuses the first field", async ({ page }) => {
  await page.goto("/login");
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page.getByText("Introduce tu usuario o correo electrónico.")).toBeVisible();
  await expect(page.getByText("Introduce tu contraseña.")).toBeVisible();
  await expect(page.getByLabel("Usuario o correo electrónico")).toBeFocused();
});
