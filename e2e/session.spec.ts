import { expect, test, type Page } from "@playwright/test";
import { ACCOUNT } from "./account";

async function signIn(page: Page, identifier: string, password: string) {
  await page.goto("/login");
  await page.getByLabel("Usuario o correo electrónico").fill(identifier);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
}

test("signing in with the email and signing out", async ({ page }) => {
  await signIn(page, ACCOUNT.email, ACCOUNT.password);
  await expect(page.getByRole("link", { name: `Mi perfil: ${ACCOUNT.username}` })).toBeVisible();

  await page.getByRole("button", { name: "Cerrar sesión" }).click();
  await expect(page.getByRole("link", { name: `Mi perfil: ${ACCOUNT.username}` })).toHaveCount(0);
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
});

test("a wrong password is rejected", async ({ page }) => {
  await signIn(page, ACCOUNT.username, "no-es-la-contraseña");
  await expect(page.getByText("Usuario, correo o contraseña incorrectos.")).toBeVisible();
  await expect(page.getByLabel("Usuario o correo electrónico")).toHaveValue(ACCOUNT.username);
});

test("too many attempts lock the form", async ({ page }) => {
  // Rate-limit buckets of its own, so neither the other tests nor a retry
  // start from an earlier count.
  const id = crypto.randomUUID().slice(0, 8);
  const ip = `10.${crypto.getRandomValues(new Uint8Array(3)).join(".")}`;
  await page.setExtraHTTPHeaders({ "x-real-ip": ip });
  for (let attempt = 0; attempt < 10; attempt++) {
    await signIn(page, `nadie_${id}`, "no-es-la-contraseña");
    await expect(page.getByText("Usuario, correo o contraseña incorrectos.")).toBeVisible();
  }
  await signIn(page, `nadie_${id}`, "no-es-la-contraseña");
  await expect(page.getByText(/^Demasiados intentos\. Vuelve a probar dentro de 1 minuto\.$/)).toBeVisible();
});
