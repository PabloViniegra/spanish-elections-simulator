import { expect, test, type Page } from "@playwright/test";
import { SIGNED_IN } from "./account";

test.use({ storageState: SIGNED_IN });

test.beforeEach(async ({ page }) => {
  await page.goto("/simulator");
});

const hemicycle = (page: Page) => page.getByRole("img", { name: /^Hemiciclo de 350 escaños/ });

test("a national edit moves the seats, and a reset can be undone", async ({ page }) => {
  const pp = page.getByRole("spinbutton", { name: "PP" });
  await expect(hemicycle(page)).toHaveAccessibleName(/PP 136,/);

  await pp.fill("40");
  await expect(pp).toHaveValue("40");
  await expect(page.getByRole("spinbutton", { name: "PSOE" })).not.toHaveValue("31.68");
  await expect(hemicycle(page)).not.toHaveAccessibleName(/PP 136,/);

  await page.getByRole("button", { name: "Volver a los resultados de julio de 2023" }).click();
  await expect(page.getByText("Escenario restablecido a los resultados de julio de 2023.")).toBeVisible();
  await expect(pp).toHaveValue("33.06");

  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(pp).toHaveValue("40");
});

test("with manual balancing an excess is flagged until it is adjusted", async ({ page }) => {
  await page.getByRole("checkbox", { name: "Cuadrar los porcentajes a mano" }).check();
  await page.getByRole("spinbutton", { name: "PP" }).fill("40");
  await expect(page.getByRole("spinbutton", { name: "PSOE" })).toHaveValue("31.68");
  await expect(page.getByText(/^Los porcentajes suman/)).toBeVisible();

  await page.getByRole("button", { name: "Ajustar a 100 %" }).click();
  await expect(page.getByText(/^Los porcentajes suman/)).toHaveCount(0);
  await expect(page.getByRole("spinbutton", { name: "PP" })).toHaveValue("40");
});

test("changing the base election can be undone", async ({ page }) => {
  const base = page.getByRole("combobox", { name: "Votos de partida" });
  await base.selectOption({ label: "Generales de junio de 2016" });
  await expect(page.getByText("Votos de partida: generales de junio de 2016.")).toBeVisible();
  await expect(page.getByRole("button", { name: "Volver a los resultados de junio de 2016" })).toBeVisible();

  await page.getByRole("button", { name: "Deshacer" }).click();
  await expect(base).toHaveValue(/2023/);
  await expect(page.getByRole("spinbutton", { name: "PP" })).toHaveValue("33.06");
});

test("editing a province fixes it until it goes back to the projection", async ({ page }) => {
  await page.getByRole("group", { name: "Modo de simulación" }).getByRole("button", { name: "Por provincia" }).click();
  const inputs = page.getByRole("region", { name: "Voto por provincia" });
  await inputs.getByRole("combobox", { name: "Provincia" }).selectOption({ label: "Sevilla" });
  await expect(inputs.getByText(/^Proyección a partir del voto nacional/)).toBeVisible();

  await inputs.getByRole("group", { name: /en Sevilla$/ }).getByRole("spinbutton", { name: "PSOE" }).fill("50");
  await expect(inputs.getByText("Fijada a mano.")).toBeVisible();
  await expect(inputs.getByRole("button", { name: "Sevilla" })).toHaveAttribute("aria-current", "true");

  await inputs.getByRole("button", { name: "Volver a la proyección" }).click();
  await expect(page.getByText("Sevilla vuelve a la proyección.")).toBeVisible();
  await expect(inputs.getByText("Provincias fijadas")).toHaveCount(0);
});

test("blocs can be renamed, added and restored", async ({ page }) => {
  await page.getByText("Editar partidos").click();
  await page.getByLabel("Nombre de PP").fill("Populares");
  await expect(page.getByRole("spinbutton", { name: "Populares" })).toHaveValue("33.06");

  const blocs = page.getByRole("list", { name: "Partidos" }).getByRole("listitem");
  const before = await blocs.count();
  await page.getByRole("button", { name: "Añadir partido" }).click();
  await expect(blocs).toHaveCount(before + 1);

  await page.getByRole("button", { name: "Volver a los partidos de julio de 2023" }).click();
  await expect(blocs).toHaveCount(before);
  await expect(page.getByRole("spinbutton", { name: "PP" })).toHaveValue("33.06");
});

test("the coalition calculator adds up the chosen parties", async ({ page }) => {
  const calculator = page.getByRole("region", { name: "Calculadora de mayorías" });
  // The swatch drawn over each checkbox takes the click, as for a user.
  await calculator.getByText("PP 136", { exact: true }).click();
  await calculator.getByText("Vox 33", { exact: true }).click();
  await expect(calculator.getByRole("checkbox", { name: "Vox 33" })).toBeChecked();
  await expect(calculator.getByText("169 escaños. Faltan 7 para la mayoría absoluta.")).toBeVisible();
});

test("the link to the current scenario is copied", async ({ page, context }) => {
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("spinbutton", { name: "PP" }).fill("40");
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  await expect(page.getByRole("status").filter({ hasText: "Enlace copiado." })).toHaveCount(1);
  expect(await page.evaluate(() => navigator.clipboard.readText())).toMatch(/\/l\/[\w-]{10}$/);
});

test("a saved simulation shows up in the profile, can be updated, renamed and deleted", async ({ page, context }) => {
  const name = "Escenario de prueba";
  await page.getByRole("spinbutton", { name: "PP" }).fill("40");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await page.getByLabel("Nombre de la simulación").fill(name);
  await page.getByRole("button", { name: "Guardar en mi perfil" }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${name}» ya está en tu perfil.` })).toHaveCount(1);
  // Once saved, further edits can overwrite it.
  await expect(page.getByRole("button", { name: "Guardar cambios" })).toBeVisible();
  await expect(page).toHaveURL(/[?&]s=/);

  await page.goto("/profile");
  await page.getByRole("link", { name: `Abrir «${name}»` }).click();
  await expect(page.getByRole("spinbutton", { name: "PP" })).toHaveValue("40");

  // Opened from the profile, it can be overwritten; the shared link leaves out which save it was.
  await page.getByRole("spinbutton", { name: "PP" }).fill("38");
  await page.getByRole("button", { name: "Guardar", exact: true }).click();
  await expect(page.getByLabel("Nombre de la simulación")).toHaveValue(name);
  await page.getByRole("button", { name: "Guardar cambios" }).click();
  await expect(page.getByRole("status").filter({ hasText: `«${name}» ya está en tu perfil.` })).toHaveCount(1);
  await context.grantPermissions(["clipboard-read", "clipboard-write"]);
  await page.getByRole("button", { name: "Copiar enlace" }).click();
  expect(await page.evaluate(() => navigator.clipboard.readText())).not.toMatch(/[?&]s=/);

  await page.goto("/profile");
  await expect(page.getByText(/actualizada el/)).toBeVisible();
  const renamed = "Escenario renombrado";
  await page.getByRole("button", { name: `Renombrar «${name}»` }).click();
  await page.getByLabel("Nuevo nombre").fill(renamed);
  await page.getByRole("button", { name: "Guardar nombre" }).click();
  await expect(page.getByRole("heading", { name: renamed })).toBeVisible();
  await expect(page.getByRole("button", { name: `Renombrar «${renamed}»` })).toBeFocused();
  await page.getByRole("link", { name: `Abrir «${renamed}»` }).click();
  await expect(page.getByRole("spinbutton", { name: "PP" })).toHaveValue("38");

  await page.goto("/profile");
  await page.getByRole("button", { name: `Eliminar «${renamed}»` }).click();
  await page.getByRole("group", { name: `Confirmar eliminación de «${renamed}»` }).getByRole("button", { name: "Sí, eliminar" }).click();
  await expect(page.getByText("Todavía no has guardado ninguna.")).toBeVisible();
});
