import { expect, test } from "@playwright/test";

// A v1 link (PP 35%, PSOE 29.74%), as in src/lib/scenario/url.test.ts.
const SHARED =
  "v1.N4IgzgxgFgpgtgQwGowE5gJYHsB2IBcAjADQgBGCYMAogDYwQAu2OAkgCYEgBMADNwGYAtLwDsIUmCgJUMMAVAAHRQQEBWXr1KKwWGAW4BOUQBZSANywAPAoUEAOSQFdEqW4IGk0EW-cOkAKyccRnkiADYtcgxadidbAXDtHHNbO1IyHABzAnDuUggffBNRUidFPHxuQgBfDNoEHABrAnsSEEYnVBwsJ0YCHCdaWhqgA";

test("the simulator asks to sign in and comes back afterwards", async ({ page }) => {
  await page.goto("/simulador");
  await expect(page).toHaveURL(/\/login\?next=%2Fsimulador$/);
  await page.getByRole("link", { name: "Crea una" }).click();
  await expect(page).toHaveURL(/\/register\?next=%2Fsimulador$/);
});

test("a shared link shows its results read-only when signed out", async ({ page }) => {
  await page.goto(`/simulador?e=${SHARED}`);
  await expect(page.getByRole("heading", { name: "Estás viendo un escenario compartido" })).toBeVisible();
  await expect(page.getByRole("group", { name: "Votos de partida" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guardar en mi perfil" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copiar enlace" })).toBeVisible();
  const login = page.getByRole("main").getByRole("link", { name: "Iniciar sesión" });
  await expect(login).toHaveAttribute("href", `/login?next=${encodeURIComponent(`/simulador?e=${SHARED}`)}`);
});

test("the profile page asks to sign in", async ({ page }) => {
  await page.goto("/perfil");
  await expect(page).toHaveURL(/\/login\?next=%2Fperfil$/);
});
