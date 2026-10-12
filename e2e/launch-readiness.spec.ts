import { expect, test } from "@playwright/test";

test("the vote base and the seat reference are distinguished", async ({ page }) => {
  await page.goto("/simulator");
  await expect(page.getByRole("spinbutton", { name: "PP", exact: true })).toBeEnabled();
  await expect(page.getByText(/Votos de partida: julio de 2023\. Reparto provincial de escaños:/)).toBeVisible();
  await page.getByText("Cómo se proyecta tu estimación", { exact: true }).click();
  await expect(page.getByText(/«Otros partidos» agrupa el voto no modelado/)).toBeVisible();
  await page.getByRole("button", { name: "Volver a los votos de julio de 2023" }).click();
  await expect(page.getByText("Escenario restablecido a los votos de julio de 2023.")).toBeVisible();
});

test("mobile edits show the edited party's seats and preserve manual balancing", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto("/simulator");
  const pp = page.getByRole("spinbutton", { name: "PP", exact: true });
  await expect(pp).toBeEnabled();
  expect(await pp.evaluate((input) => Number.parseFloat(getComputedStyle(input).fontSize))).toBeGreaterThanOrEqual(16);
  await pp.fill("35");
  const strip = page.getByRole("link", { name: /Ver el reparto de escaños/ });
  await expect(strip.getByRole("status")).toHaveText("PP 145 escaños");
  await expect(page.getByText("PP 145 escaños", { exact: true }).last()).toBeVisible();
  await page.getByRole("checkbox", { name: "Ajuste manual" }).check();
  const psoe = page.getByRole("spinbutton", { name: "PSOE", exact: true });
  const previous = await psoe.inputValue();
  await pp.fill("40");
  await expect(psoe).toHaveValue(previous);
  await expect(strip.getByRole("status")).toContainText("Último reparto válido.");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await strip.focus();
  await strip.press("Enter");
  await expect(page).toHaveURL(/#resultados$/);
});

test("unknown pages offer Spanish recovery links and a contact channel", async ({ page }) => {
  const response = await page.goto("/pagina-inexistente");
  expect(response?.status()).toBe(404);
  await expect(page.getByRole("heading", { name: "No encontramos esta página" })).toBeVisible();
  await expect(page.getByRole("link", { name: "Volver al inicio", exact: true })).toHaveAttribute("href", "/");
  await expect(page.getByRole("link", { name: "Comunicar un problema" })).toHaveAttribute("href", /^mailto:/);
  const simulator = page.getByRole("link", { name: "Ir al simulador", exact: true });
  await simulator.focus();
  await simulator.press("Enter");
  await expect(page.getByRole("combobox", { name: "Votos de partida" })).toBeVisible();
});
