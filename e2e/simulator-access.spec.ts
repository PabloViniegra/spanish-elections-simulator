import { expect, test } from "@playwright/test";
import election2023 from "../src/data/elections/2023-07.json";
import { blocs2023 } from "../src/lib/elections/blocs-2023";
import { provinces } from "../src/lib/provinces";
import { baseScenario } from "../src/lib/scenario/simulate";
import { encodeScenario } from "../src/lib/scenario/url";

// A v1 link (PP 35%, PSOE 29.74%), as in src/lib/scenario/url.test.ts.
const SHARED =
  "v1.N4IgzgxgFgpgtgQwGowE5gJYHsB2IBcAjADQgBGCYMAogDYwQAu2OAkgCYEgBMADNwGYAtLwDsIUmCgJUMMAVAAHRQQEBWXr1KKwWGAW4BOUQBZSANywAPAoUEAOSQFdEqW4IGk0EW-cOkAKyccRnkiADYtcgxadidbAXDtHHNbO1IyHABzAnDuUggffBNRUidFPHxuQgBfDNoEHABrAnsSEEYnVBwsJ0YCHCdaWhqgA";
const base = baseScenario(election2023, blocs2023);
const blocIds = Object.keys(base.shares);
const provincesScenario = Object.fromEntries(
  provinces.map(({ code }, provinceIndex) => [
    code,
    {
      shares: Object.fromEntries(
        blocIds.map((id, blocIndex) => [id, Math.floor(5000 / blocIds.length) + ((provinceIndex * 17 + blocIndex * 31) % 20)]),
      ),
      blank: 500,
    },
  ]),
);
const LONG_SHARED = encodeScenario({ ...base, provinces: provincesScenario });

test("the simulator asks to sign in and comes back afterwards", async ({ page }) => {
  await page.goto("/simulator");
  await expect(page).toHaveURL(/\/login\?next=%2Fsimulator$/);
  await page.getByRole("link", { name: "Crea una" }).click();
  await expect(page).toHaveURL(/\/register\?next=%2Fsimulator$/);
});

test("a shared link shows its results read-only when signed out", async ({ page }) => {
  await page.goto(`/simulator?e=${SHARED}`);
  await expect(page.getByRole("heading", { name: "Escenario compartido sobre las generales de julio de 2023" })).toBeVisible();
  await expect(page.getByRole("combobox", { name: "Votos de partida" })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Guardar", exact: true })).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Copiar enlace" })).toBeVisible();
  const login = page.getByRole("main").getByRole("link", { name: "Iniciar sesión" });
  await expect(login).toHaveAttribute("href", `/login?next=${encodeURIComponent(`/simulator?e=${SHARED}`)}`);
});

test("a shared link previews its own chamber, and a broken one the site's", async ({ page, request }) => {
  await page.goto(`/simulator?e=${SHARED}`);
  const image = page.locator('meta[property="og:image"]');
  await expect(image).toHaveAttribute("content", new RegExp(`/simulator/og\\?e=${SHARED.replace(/\./g, "\\.")}$`));
  await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute("content", /\/simulator\/og\?e=/);

  const preview = await request.get(`/simulator/og?e=${SHARED}`);
  expect(preview.status()).toBe(200);
  expect(preview.headers()["content-type"]).toBe("image/png");
  expect(preview.headers()["cache-control"]).toContain("s-maxage=");

  // A broken one is sent to the site image without rendering another.
  const broken = await request.get("/simulator/og?e=v1.roto", { maxRedirects: 0 });
  expect(broken.status()).toBe(308);
  expect(new URL(broken.headers().location ?? "", "http://x").pathname).toBe("/opengraph-image");
  const site = await request.get("/simulator/og?e=v1.roto");
  expect(site.headers()["content-type"]).toBe("image/png");
});

test("a long provincial scenario is copied as a short link that opens it", async ({ page, context, request }) => {
  expect(LONG_SHARED.length).toBeGreaterThan(2000);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.goto(`/simulator?e=${encodeURIComponent(LONG_SHARED)}`);
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Enlace copiado." })).toHaveCount(1);
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/l\/[\w-]{10}$/);

  await page.goto(link);
  expect(new URL(page.url()).searchParams.get("e")).toBe(LONG_SHARED);
  expect((await request.get("/l/desconocido")).status()).toBe(404);
});

test("the profile page asks to sign in", async ({ page }) => {
  await page.goto("/profile");
  await expect(page).toHaveURL(/\/login\?next=%2Fprofile$/);
});
