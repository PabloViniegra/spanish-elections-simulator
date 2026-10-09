import { expect, test } from "@playwright/test";
import election from "../src/data/elections/2023-07.json";
import map from "../src/data/map/provinces.json";
import { blocs2023 } from "../src/lib/elections/blocs-2023";
import { baseScenario } from "../src/lib/scenario/simulate";
import { encodeScenario } from "../src/lib/scenario/url";

test.use({ hasTouch: true });
const shared = encodeScenario(baseScenario(election, blocs2023));
const madrid = map.provinces.find(({ code }) => code === "28")!;

for (const width of [360, 1280]) {
  test(`the map tracks mouse movement and keeps touch selection at ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 900 });
    await page.goto(`/simulator?e=${encodeURIComponent(shared)}`);
    const svg = page.getByRole("img", { name: /^Mapa del partido/ });
    await svg.scrollIntoViewIfNeeded();
    const box = (await svg.boundingBox())!;
    const x = box.x + madrid.x / map.width * box.width;
    const y = box.y + madrid.y / map.height * box.height;
    const tooltip = svg.locator("..").locator('div[aria-hidden="true"]');
    await page.mouse.move(x, y);
    await expect(tooltip).toContainText("Madrid");
    const style = await tooltip.getAttribute("style");
    await page.mouse.move(x + 2, y + 2);
    await expect(tooltip).not.toHaveAttribute("style", style!);
    await page.mouse.move(0, 0);
    await expect(tooltip).toHaveCount(0);
    await page.touchscreen.tap(x, y);
    await expect(tooltip).toHaveCount(0);
    await expect(page.getByRole("button", { name: "Ver el reparto D’Hondt de Madrid", exact: true })).toBeVisible();
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  });
}
