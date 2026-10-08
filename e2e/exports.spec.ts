import { readFile } from "node:fs/promises";
import { expect, test } from "@playwright/test";

declare global {
  interface Window {
    __exportDrawnText?: string[];
  }
}

const SHARED = "v1.N4IgzgxgFgpgtgQwGowE5gJYHsB2IBcAjADQgBGCYMAogDYwQAu2OAkgCYEgBMADNwGYAtLwDsIUmCgJUMMAVAAHRQQEBWXr1KKwWGAW4BOUQBZSANywAPAoUEAOSQFdEqW4IGk0EW-cOkAKyccRnkiADYtcgxadidbAXDtHHNbO1IyHABzAnDuUggffBNRUidFPHxuQgBfDNoEHABrAnsSEEYnVBwsJ0YCHCdaWhqgA";

test("downloads the shared scenario as CSV and PNG on a narrow screen", async ({ page }) => {
  const errors: string[] = [];
  await page.addInitScript(() => {
    const texts: string[] = [];
    window.__exportDrawnText = texts;
    const fillText = CanvasRenderingContext2D.prototype.fillText;
    CanvasRenderingContext2D.prototype.fillText = function (text, x, y, maxWidth) {
      texts.push(String(text));
      return fillText.call(this, text, x, y, maxWidth);
    };
  });
  page.on("pageerror", (error) => errors.push(error.message));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`/simulator?e=${SHARED}`);
  await page.getByRole("button", { name: "Descargar", exact: true }).click();
  const csvButton = page.getByRole("button", { name: "Descargar CSV", exact: true });
  await csvButton.focus();
  await expect(csvButton).toBeFocused();
  const csvPending = page.waitForEvent("download");
  await page.keyboard.press("Enter");
  const csvDownload = await csvPending;
  expect(csvDownload.suggestedFilename()).toMatch(/^simulacion-2023-07-[a-z0-9]+\.csv$/);
  expect(await csvDownload.failure()).toBeNull();
  const csv = await readFile((await csvDownload.path())!, "utf8");
  const rows = csv.slice(1).trim().split("\r\n").slice(1).map((row) => row.split(","));
  expect(new Set(rows.map((row) => row[0])).size).toBe(52);
  expect(rows.reduce((sum, row) => sum + Number(row[6]), 0)).toBe(350);
  await expect(page.getByText("CSV descargado", { exact: true })).toBeVisible();

  const pngPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar PNG", exact: true }).click();
  const pngDownload = await pngPending;
  expect(pngDownload.suggestedFilename()).toMatch(/^hemiciclo-2023-07-[a-z0-9]+\.png$/);
  expect(await pngDownload.failure()).toBeNull();
  const png = await readFile((await pngDownload.path())!);
  expect(png.subarray(0, 8).toString("hex")).toBe("89504e470d0a1a0a");
  expect(png.readUInt32BE(16)).toBe(1200);
  expect(png.readUInt32BE(20)).toBeGreaterThan(900);
  const drawnText = await page.evaluate(() => window.__exportDrawnText?.join("") ?? "");
  expect(drawnText).toContain(page.url());
  await pngDownload.saveAs(test.info().outputPath("hemicycle.png"));
  await expect(page.getByText("PNG descargado", { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  const box = await csvButton.boundingBox();
  expect(box!.height).toBeGreaterThanOrEqual(44);
  expect(errors).toEqual([]);
});

test("reports PNG failures and allows retry", async ({ page }) => {
  await page.addInitScript(() => {
    HTMLCanvasElement.prototype.toBlob = function (callback) { callback(null); };
  });
  await page.goto(`/simulator?e=${SHARED}`);
  await page.getByRole("button", { name: "Descargar", exact: true }).click();
  await page.getByRole("button", { name: "Descargar PNG", exact: true }).click();
  await expect(page.getByText("No se ha podido descargar el PNG", { exact: true })).toBeVisible();
  await expect(page.getByRole("button", { name: "Descargar PNG", exact: true })).toBeEnabled();
  await expect(page.getByRole("button", { name: "Descargar CSV", exact: true })).toBeEnabled();
});
