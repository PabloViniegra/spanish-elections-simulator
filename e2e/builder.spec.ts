import { expect, type Page, test } from "@playwright/test";
import { and, eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { simulation } from "../src/lib/db/schema";
import { SIGNED_IN } from "./account";
import { confirmEmail } from "./db";

test("signed-out visitors are sent to log in", async ({ page }) => {
  await page.goto("/");
  await page.getByRole("navigation", { name: "Principal" }).getByRole("link", { name: "Construir" }).click();
  await expect(page).toHaveURL(/\/login\?next=%2Fbuilder%2Fnew$/);
});

// A fresh account, so the saved elections never show up in other profile tests.
async function signUpTo(page: Page, next: string) {
  await page.setExtraHTTPHeaders({ "x-real-ip": `10.${crypto.getRandomValues(new Uint8Array(3)).join(".")}` });
  const id = crypto.randomUUID().slice(0, 8);
  const email = `builder-${id}@example.com`;
  const password = "contraseña-constructor";
  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(`builder_${id}`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email/);
  await confirmEmail(email);
  await page.goto(`/login?next=${encodeURIComponent(next)}`);
  await page.getByLabel("Usuario o correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(next);
}

test("a signed-in user creates a built election and fills it in province by province", async ({ page, browser }) => {
  await signUpTo(page, "/builder/new");
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(page.getByText("Son unas elecciones construidas a mano, no una previsión.")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  const name = `Construidas ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page.getByText("Elige al menos un partido.")).toBeFocused();
  await expect(page.getByLabel("Nombre", { exact: true })).toHaveValue(name);

  await page.getByLabel("Escaños de 2023").check();
  await page.getByLabel("Buscar partidos que se presentaron desde 2016").fill("socialista obrero");
  await page.getByRole("button", { name: "Añadir PSOE", exact: true }).click();
  await expect(page.getByRole("button", { name: "Añadido PSOE", exact: true })).toBeDisabled();
  await page.getByLabel("Crear un partido propio").fill("Mi Partido");
  await page.getByLabel("Crear un partido propio").press("Enter");
  const chosen = page.getByRole("region", { name: "Partidos de estas elecciones" });
  await expect(chosen.getByRole("listitem")).toHaveCount(2);
  await expect(chosen.locator("abbr[title='Partido Socialista Obrero Español']")).toHaveText("PSOE");

  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page).toHaveURL(/\/builder\/[^/?]+\?p=01$/);
  const address = new URL(page.url()).pathname;

  const [saved] = await db.select().from(simulation).where(and(eq(simulation.name, name), eq(simulation.kind, "built")));
  expect(JSON.parse(saved.scenario)).toMatchObject({
    schemaVersion: 1,
    seatTable: "2023",
    parties: [{ id: "psoe", name: "PSOE", catalogId: "psoe" }, { id: "propio", name: "Mi Partido" }],
    provinces: {},
  });

  // The first province, not started: PSOE ran in Álava as PSE-EE, so it starts marked.
  await expect(page.getByRole("heading", { level: 2, name: "Araba/Álava", exact: true })).toBeVisible();
  await expect(page.getByText("Provincia 1 de 52")).toBeVisible();
  await expect(page.getByText("Sin empezar.")).toBeVisible();
  await expect(page.getByLabel("PSOE se presenta en Araba/Álava")).toBeChecked();
  await expect(page.getByLabel("Mi Partido se presenta en Araba/Álava")).not.toBeChecked();
  await page.getByLabel("PSOE se presenta en Araba/Álava").uncheck();

  // A party missing from the list joins it from the province, already running.
  await page.getByText("¿Falta un partido? Añádelo a tu lista").click();
  await page.getByLabel("Buscar partidos que se presentaron en Araba/Álava").fill("nacionalista vasco");
  await page.getByRole("button", { name: "Añadir PNV", exact: true }).click();
  await expect(page.getByLabel("PNV se presenta en Araba/Álava")).toBeChecked();
  await page.getByLabel("Votos de PNV").fill("50000");
  await page.getByLabel("Mi Partido se presenta en Araba/Álava").check();
  await page.getByLabel("Votos de Mi Partido").fill("20000");
  await expect(page.getByRole("region", { name: "Reparto en Araba/Álava" }).getByRole("listitem")).toHaveText(["PNV 3 escaños", "Mi Partido 1 escaño"]);
  await expect(page.getByText("Completa.")).toBeVisible();

  // Next province in place, keeping the focus on its name.
  await page.getByRole("navigation", { name: "Provincia anterior y siguiente" }).getByRole("link", { name: "Albacete" }).click();
  await expect(page).toHaveURL(`${address}?p=02`);
  await expect(page.getByRole("heading", { level: 2, name: "Albacete", exact: true })).toBeFocused();
  await page.getByLabel("PSOE se presenta en Albacete").check();
  await page.getByLabel("Votos de PSOE").fill("50000");
  await page.getByLabel("Mi Partido se presenta en Albacete").check();
  await page.getByLabel("Votos de Mi Partido").fill("20000");
  await expect(page.getByRole("region", { name: "Reparto en Albacete" }).getByRole("listitem")).toHaveText(["PSOE 3 escaños", "Mi Partido 1 escaño"]);

  // More votes than electors block the province until fixed.
  await page.getByLabel("Votos en blanco").fill("9999999");
  await expect(page.getByText("Hay más votos que electores en el censo.", { exact: false })).toBeVisible();
  await page.getByLabel("Votos en blanco").fill("1000");
  await expect(page.getByRole("status").filter({ hasText: "Guardado en tu perfil" })).toBeVisible();
  const [row] = await db.select().from(simulation).where(eq(simulation.name, name));
  expect(JSON.parse(row.scenario).parties.map(({ id }: { id: string }) => id)).toEqual(["psoe", "propio", "pnv"]);
  expect(JSON.parse(row.scenario).provinces).toEqual({
    "01": { votes: { pnv: 50000, propio: 20000 }, blank: 0, null: 0 },
    "02": { votes: { psoe: 50000, propio: 20000 }, blank: 1000, null: 0 },
  });

  // Back keeps the votes; the index jumps anywhere and says how far each province is.
  await page.goBack();
  await expect(page.getByLabel("Votos de Mi Partido")).toHaveValue("20000");
  const index = page.getByRole("navigation", { name: "Provincias" });
  await page.getByText("Ver las 52 provincias y su progreso", { exact: true }).click();
  await index.getByRole("link", { name: /^Madrid/ }).click();
  await expect(page).toHaveURL(`${address}?p=28`);
  await page.reload();
  await expect(page.getByRole("heading", { level: 2, name: "Madrid", exact: true })).toBeVisible();
  await expect(page.getByText("Un partido de tu lista no se presentó nunca aquí.", { exact: false })).toBeVisible();
  await page.getByText("Ver las 52 provincias y su progreso", { exact: true }).click();
  await expect(index.getByRole("link", { name: "Albacete, completa" })).toBeVisible();
  await expect(page.getByText("2 de 52 provincias completas.")).toBeVisible();

  // The 2023 votes fill the empty boxes of the parties running.
  await page.getByRole("button", { name: "Rellenar los huecos con los votos de 2023" }).click();
  await expect(page.getByLabel("Votos de PSOE")).toHaveValue("1004599");
  await expect(page.getByLabel("Votos de Mi Partido")).toHaveCount(0);

  // Leaving before the debounce expires waits for the pending edit.
  await page.getByLabel("Votos en blanco").fill("123");
  await page.getByRole("link", { name: "Mi perfil", exact: true }).click();
  await expect(page).toHaveURL("/profile");
  await page.goto(`${address}?p=28`);
  await expect(page.getByLabel("Votos en blanco")).toHaveValue("123");

  // Nobody else can open it.
  const other = await browser.newContext({ storageState: SIGNED_IN });
  const response = await (await other.newPage()).goto(address);
  expect(response?.status()).toBe(404);
  await other.close();
});

test("stale tabs cannot overwrite a saved province and failed saves block navigation", async ({ page, context }) => {
  await signUpTo(page, "/builder/new");
  const name = `Concurrentes ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByLabel("Crear un partido propio").fill("Mi Partido");
  await page.getByLabel("Crear un partido propio").press("Enter");
  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page).toHaveURL(/\/builder\/[^/?]+\?p=01$/);
  const address = new URL(page.url()).pathname;
  const stale = await context.newPage();
  await stale.goto(`${address}?p=02`);
  await expect(stale.getByLabel("Votos en blanco")).toHaveValue("");

  await page.getByLabel("Mi Partido se presenta en Araba/Álava").check();
  await page.getByLabel("Votos de Mi Partido").fill("1000");
  await expect(page.getByRole("status").filter({ hasText: "Guardado en tu perfil" })).toBeVisible();
  await stale.getByLabel("Votos en blanco").fill("222");
  await stale.getByRole("link", { name: "Mi perfil", exact: true }).click();
  await expect(stale.getByRole("status").filter({ hasText: /han cambiado en otra pestaña/ })).toBeVisible();
  await expect(stale).toHaveURL(`${address}?p=02`);
  await expect(stale.getByLabel("Votos en blanco")).toHaveValue("222");
  const [saved] = await db.select().from(simulation).where(eq(simulation.name, name));
  expect(JSON.parse(saved.scenario).provinces).toEqual({ "01": { votes: { propio: 1000 }, blank: 0, null: 0 } });
  await stale.close();
});

test("a built election can be discarded halfway, with an unsaved edit pending", async ({ page }) => {
  await signUpTo(page, "/builder/new");
  const name = `Descartadas ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByLabel("Crear un partido propio").fill("Mi Partido");
  await page.getByLabel("Crear un partido propio").press("Enter");
  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page).toHaveURL(/\/builder\/[^/?]+\?p=01$/);
  const address = new URL(page.url()).pathname;

  await page.getByLabel("Mi Partido se presenta en Araba/Álava").check();
  await page.getByRole("button", { name: "Descartar estas elecciones" }).click();
  await expect(page.getByRole("button", { name: "Cancelar" })).toBeFocused();
  await page.getByRole("button", { name: "Cancelar" }).click();
  await page.getByRole("button", { name: "Descartar estas elecciones" }).click();
  await page.getByRole("button", { name: "Sí, descartar" }).click();
  await expect(page).toHaveURL("/profile");
  await expect(page.getByRole("status").filter({ hasText: `«${name}» ya no está en tu perfil.` })).toBeVisible();
  await expect(page.getByRole("region", { name: /Tus simulaciones/ }).getByText(name)).toHaveCount(0);
  expect(await db.select().from(simulation).where(eq(simulation.name, name))).toEqual([]);
  expect((await page.goto(address))?.status()).toBe(404);
});

test("a complete built election shows its Congreso, shares read-only and is tagged in the profile", async ({ page, context }) => {
  await signUpTo(page, "/builder/new");
  const name = `Completas ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  for (const party of ["Mi Partido", "Otro Partido"]) {
    await page.getByLabel("Crear un partido propio").fill(party);
    await page.getByLabel("Crear un partido propio").press("Enter");
  }
  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page).toHaveURL(/\/builder\/[^/?]+\?p=01$/);
  const address = new URL(page.url()).pathname;

  // All but Melilla filled in at once; the last one by hand.
  const filled = { votes: { propio: 1000, "propio-2": 500 }, blank: 0, null: 0 };
  const [row] = await db.select().from(simulation).where(eq(simulation.name, name));
  const scenario = JSON.parse(row.scenario);
  scenario.provinces = Object.fromEntries(Array.from({ length: 51 }, (_, index) => [String(index + 1).padStart(2, "0"), filled]));
  await db.update(simulation).set({ scenario: JSON.stringify(scenario) }).where(eq(simulation.id, row.id));

  await page.goto(`${address}?p=52`);
  await expect(page.getByText("51 de 52 provincias completas.")).toBeVisible();
  await expect(page.getByRole("link", { name: "Ver el Congreso" })).toHaveCount(0);
  await page.goto(`${address}/results`);
  await expect(page).toHaveURL(new RegExp(`${address}(\\?p=52)?$`));
  await page.getByLabel("Mi Partido se presenta en Melilla").check();
  await page.getByLabel("Votos de Mi Partido").fill("1000");
  await expect(page.getByText("Las 52 provincias están completas.")).toBeVisible();
  await page.getByRole("link", { name: "Ver el Congreso" }).click();

  await expect(page).toHaveURL(`${address}/results`);
  await expect(page.getByRole("heading", { level: 1, name })).toBeVisible();
  const national = page.getByRole("table", { name: "Votos, porcentaje del voto válido y escaños de cada partido" });
  await expect(national.getByRole("row")).toHaveText([/Partido/, /^Mi Partido/, /^Otro Partido/, /^Votos en blanco/]);
  await expect(page.getByRole("heading", { name: "Calculadora de mayorías" })).toBeVisible();
  await expect(page.getByText("Son unas elecciones construidas a mano, no una previsión.").first()).toBeVisible();

  // The link keeps the election as it is now, for anyone.
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByText("Enlace copiado", { exact: true })).toBeVisible();
  const link = await page.evaluate(() => navigator.clipboard.readText());
  expect(link).toMatch(/\/l\/[\w-]{10}$/);
  const visitor = await page.context().browser()!.newContext();
  const shared = await visitor.newPage();
  await shared.goto(link);
  await expect(shared).toHaveURL(link);
  await expect(shared.getByRole("heading", { level: 1, name: "Elecciones construidas" })).toBeVisible();
  await expect(shared.getByRole("link", { name: "Editar las provincias" })).toHaveCount(0);
  await expect(shared.getByRole("button", { name: "Copiar enlace" })).toHaveCount(0);
  await visitor.close();

  const csvPending = page.waitForEvent("download");
  await page.getByRole("button", { name: "Descargar", exact: true }).click();
  await page.getByRole("button", { name: "Descargar CSV", exact: true }).click();
  expect((await csvPending).suggestedFilename()).toBe("simulacion-construidas-2026.csv");

  await page.goto("/profile");
  const saved = page.getByRole("listitem").filter({ has: page.getByRole("heading", { name }) });
  await expect(saved.getByText("Construcción manual", { exact: true })).toBeVisible();
  await page.setViewportSize({ width: 360, height: 800 });
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await saved.scrollIntoViewIfNeeded();
  await expect(saved.getByText(/^Construidas a mano: Mi Partido \d+ · Otro Partido \d+\./)).toBeVisible();
  await saved.getByRole("link", { name: `Abrir «${name}»` }).click();
  await expect(page).toHaveURL(`${address}/results`);
});

test("24-party built elections paginate coalitions without rendering the full list", async ({ page }) => {
  await signUpTo(page, "/builder/new");
  const name = `Veinticuatro ${crypto.randomUUID().slice(0, 8)}`;
  await page.getByLabel("Nombre", { exact: true }).fill(name);
  await page.getByLabel("Crear un partido propio").fill("Mi Partido");
  await page.getByLabel("Crear un partido propio").press("Enter");
  await page.getByRole("button", { name: "Crear y empezar por la primera provincia" }).click();
  await expect(page).toHaveURL(/\/builder\/[^/?]+\?p=01$/);
  const address = new URL(page.url()).pathname;
  const [row] = await db.select().from(simulation).where(eq(simulation.name, name));
  const parties = Array.from({ length: 24 }, (_, i) => ({ id: `p${i}`, name: `Alternativa Territorial Democrática ${i}`, colour: "#18307b" }));
  const province = { votes: Object.fromEntries(parties.map(({ id }) => [id, 1000])), blank: 0, null: 0 };
  const scenario = { schemaVersion: 1, seatTable: "2026", parties, provinces: Object.fromEntries(Array.from({ length: 52 }, (_, i) => [String(i + 1).padStart(2, "0"), province])) };
  await db.update(simulation).set({ scenario: JSON.stringify(scenario) }).where(eq(simulation.id, row.id));
  await page.setViewportSize({ width: 360, height: 800 });
  await page.goto(`${address}?p=01`);
  const votes = page.getByRole("group", { name: "Votos en Araba/Álava" });
  await expect(votes.getByText(parties[23].name, { exact: true })).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  const detail = page.getByRole("region", { name: "Reparto en Araba/Álava" });
  await expect(detail.getByRole("table")).toBeHidden();
  await detail.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(detail.getByRole("table")).toBeVisible();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await detail.locator("summary").click();
  const lastInput = page.getByLabel(`Votos de ${parties[23].name}`, { exact: true });
  await lastInput.fill("1001");
  const inputBounds = await lastInput.boundingBox();
  expect(inputBounds && inputBounds.y >= 0 && inputBounds.y + inputBounds.height <= 680).toBeTruthy();
  const stepper = page.getByRole("navigation", { name: "Provincia anterior y siguiente" });
  const next = stepper.getByRole("link", { name: "Albacete" });
  const bounds = await next.boundingBox();
  expect(bounds && bounds.y >= 0 && bounds.y + bounds.height <= 800).toBeTruthy();
  await page.getByText(/^Reparto ·/).click();
  await expect(page.getByRole("list", { name: "Reparto rápido" })).toBeVisible();
  await expect(page.getByRole("list", { name: "Reparto rápido" }).getByText(parties[23].name, { exact: true })).toBeVisible();
  await page.getByText(/^Reparto ·/).click();
  await expect(page.getByRole("status").filter({ hasText: "Guardado en tu perfil" })).toBeVisible();
  await next.click();
  await expect(page.getByRole("heading", { name: "Albacete", exact: true })).toBeFocused();
  await page.setViewportSize({ width: 768, height: 900 });
  await page.getByRole("heading", { name: "Albacete", exact: true }).scrollIntoViewIfNeeded();
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.evaluate(() => window.scrollTo(0, 0));
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  // Restore the equal-vote fixture for the exact coalition-count regression.
  await db.update(simulation).set({ scenario: JSON.stringify(scenario) }).where(eq(simulation.id, row.id));
  await page.goto(`${address}/results`);
  const calculator = page.getByRole("region", { name: "Calculadora de mayorías" });
  await calculator.locator("summary").click();
  const items = calculator.getByRole("list", { name: "Combinaciones mínimas" }).getByRole("listitem");
  await expect(items).toHaveCount(50);
  await expect(calculator.getByRole("status")).toContainText("1694673 combinaciones");
  const first = await items.first().innerText();
  await calculator.getByRole("navigation", { name: "Páginas de combinaciones (inicio)" }).getByRole("button", { name: "Siguiente" }).click();
  await expect(calculator.getByRole("status")).toContainText("Página 2 de");
  await expect(items.first()).not.toHaveText(first);
  await page.setViewportSize({ width: 360, height: 800 });
  await expect(items).toHaveCount(12);
  await expect(calculator.getByRole("status")).toContainText("Página 1 de");
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
  await calculator.getByRole("status").scrollIntoViewIfNeeded();
});
