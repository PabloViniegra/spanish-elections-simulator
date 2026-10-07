import { expect, test } from "@playwright/test";

test("home page renders in Spanish", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Simulador de escaños del Congreso · Elecciones 29 de noviembre de 2026");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
