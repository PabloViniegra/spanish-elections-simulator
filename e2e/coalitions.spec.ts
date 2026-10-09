import { expect, test } from "@playwright/test";
import { encodeScenario } from "../src/lib/scenario/url";

const blocs = Array.from({ length: 16 }, (_, index) => ({ id: `n${index + 1}`, name: `Partido ${index + 1}`, colour: "#18307b", candidacyIds: [] }));
const shared = encodeScenario({ schemaVersion: 1, baseElectionId: "2023-07", shares: Object.fromEntries(blocs.map(({ id }) => [id, 600])), blank: 100, turnout: null, blocs });

test("large coalition lists load on demand and paginate with the keyboard", async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/simulator?e=${encodeURIComponent(shared)}`);
  const calculator = page.getByRole("region", { name: "Calculadora de mayorías" });
  const summary = calculator.locator("summary");
  const items = calculator.getByRole("list", { name: "Combinaciones mínimas" }).getByRole("listitem");
  await expect(items).toHaveCount(0);
  await summary.focus();
  await page.keyboard.press("Enter");
  await expect(items).toHaveCount(50);
  await expect(calculator.getByRole("status")).toContainText("Página 1 de");
  const first = await items.first().innerText();
  await calculator.getByRole("button", { name: "Siguiente" }).focus();
  await page.keyboard.press("Enter");
  await expect(calculator.getByRole("status")).toContainText("Página 2 de");
  await expect(items.first()).not.toHaveText(first);
  await summary.click();
  await expect(items).toHaveCount(0);
  await summary.click();
  await expect(calculator.getByRole("status")).toContainText("Página 1 de");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
});
