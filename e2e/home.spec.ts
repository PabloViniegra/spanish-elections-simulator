import { expect, test } from "@playwright/test";

test("home page renders in Spanish", async ({ page }) => {
  await page.goto("/");
  await expect(page).toHaveTitle("Simulador de Elecciones");
  await expect(page.locator("html")).toHaveAttribute("lang", "es");
});
