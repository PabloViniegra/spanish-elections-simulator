import { expect, test } from "@playwright/test";
import { eq } from "drizzle-orm";
import { db } from "../src/lib/db/client";
import { simulation, user } from "../src/lib/db/schema";
import { defaultBase } from "../src/lib/elections/bases";
import { baselineOf } from "../src/lib/scenario/baselines";
import { encodeScenario, simulatorHref } from "../src/lib/scenario/address";
import { insertSimulationIfRoom } from "../src/lib/simulations/queries";
import { confirmEmail } from "./db";

test("another user cannot read private save metadata, overwrite, rename or delete a saved simulation", async ({ page }) => {
  await page.setExtraHTTPHeaders({ "x-real-ip": `10.${crypto.getRandomValues(new Uint8Array(3)).join(".")}` });
  const id = crypto.randomUUID().slice(0, 8);
  const email = `other-${id}@example.com`;
  const password = "contraseña-otro-usuario";
  await page.goto("/register");
  await page.getByLabel("Nombre de usuario").fill(`other_${id}`);
  await page.getByLabel("Correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Crear cuenta" }).click();
  await expect(page).toHaveURL(/\/register\/check-email/);
  await confirmEmail(email);
  await page.goto("/login");
  await page.getByLabel("Usuario o correo electrónico").fill(email);
  await page.getByLabel("Contraseña", { exact: true }).fill(password);
  await page.getByRole("button", { name: "Iniciar sesión" }).click();
  await expect(page).toHaveURL(/\/$/);

  // Keep both principals private to this test so parallel profile tests stay isolated.
  const [owner] = await db.insert(user).values({ id: crypto.randomUUID(), name: `owner_${id}`, email: `owner-${id}@example.com` }).returning({ id: user.id });
  const [other] = await db.select({ id: user.id }).from(user).where(eq(user.email, email));
  const scenario = encodeScenario(baselineOf(defaultBase).scenario);
  const privateName = `Privado ${id}`;
  const ownName = `Propio ${id}`;
  const foreignId = await insertSimulationIfRoom(owner.id, privateName, scenario);
  const ownId = await insertSimulationIfRoom(other.id, ownName, scenario);
  expect(foreignId).toBeTruthy();
  expect(ownId).toBeTruthy();
  const foreignRow = async () => (await db.select().from(simulation).where(eq(simulation.id, foreignId!)))[0];
  const before = await foreignRow();
  try {
    await page.goto("/profile");
    await expect(page.getByRole("heading", { name: ownName })).toBeVisible();
    await expect(page.getByText(privateName)).toHaveCount(0);
    await page.goto(simulatorHref(scenario, foreignId!));
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await expect(page.getByRole("button", { name: "Guardar cambios" })).toHaveCount(0);
    await expect(page.getByLabel("Nombre de la simulación")).not.toHaveValue(privateName);

    await page.goto(simulatorHref(scenario, ownId!));
    await page.getByRole("spinbutton", { name: "PP", exact: true }).fill("40");
    await page.getByRole("button", { name: "Guardar", exact: true }).click();
    await page.locator('input[name="id"]').evaluate((element, target) => { if (element instanceof HTMLInputElement) element.value = target; }, foreignId!);
    await page.getByRole("button", { name: "Guardar cambios" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no está en tu perfil" })).toBeVisible();
    expect(await foreignRow()).toEqual(before);

    await page.goto("/profile");
    await page.getByRole("button", { name: `Renombrar «${ownName}»` }).click();
    await page.getByLabel("Nuevo nombre").fill("Nombre ajeno");
    await page.locator('input[name="id"]').evaluate((element, target) => { if (element instanceof HTMLInputElement) element.value = target; }, foreignId!);
    await page.getByRole("button", { name: "Guardar nombre" }).click();
    await expect(page.getByRole("alert").filter({ hasText: "no está en tu perfil" })).toBeVisible();
    expect(await foreignRow()).toEqual(before);

    // Delete passes an argument rather than a form field; forge that argument in transit.
    let forged = false;
    await page.route("**/profile", async (route) => {
      const request = route.request();
      if (request.method() !== "POST" || !request.headers()["next-action"]) return route.continue();
      const body = request.postData();
      if (!body?.includes(ownId!)) return route.continue();
      forged = true;
      await route.continue({ postData: body.replaceAll(ownId!, foreignId!) });
    });
    await page.getByRole("button", { name: `Eliminar «${ownName}»` }).click();
    await page.getByRole("button", { name: "Sí, eliminar" }).click();
    await expect(page.getByText("No se pudo eliminar", { exact: true })).toBeVisible();
    expect(forged).toBe(true);
    expect(await foreignRow()).toEqual(before);
  } finally {
    await db.delete(simulation).where(eq(simulation.id, foreignId!));
    await db.delete(simulation).where(eq(simulation.id, ownId!));
    await db.delete(user).where(eq(user.id, owner.id));
  }
});
