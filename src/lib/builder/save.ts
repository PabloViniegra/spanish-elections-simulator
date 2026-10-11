import { z } from "zod";
import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { MAX_SIMULATIONS, type SaveState, simulationName } from "@/lib/simulations/forms";
import type { InsertIfRoom } from "@/lib/simulations/save";
import type { BuilderReference } from "./allocate";
import { parseBuiltScenario } from "./schema";
import type { BuiltScenario } from "./types";

// Compare-and-swap against the exact snapshot loaded by this editor.
export type UpdateOwnedBuilt = (userId: string, id: string, scenario: string, expected: string) => Promise<boolean>;

export type DraftState = { saved: true } | { error: string };

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";
const full = `Ya tienes ${MAX_SIMULATIONS} simulaciones guardadas. Borra alguna desde tu perfil para crear otra.`;
const conflict = "No se han guardado los cambios: estas elecciones han cambiado en otra pestaña o ya no están en tu perfil. Conserva tus cambios antes de recargar.";
const invalid = "Los datos de las elecciones no son válidos. Recarga la página e inténtalo de nuevo.";
// Shown until the first party is added, so the form can drop it then.
export const NO_PARTIES = "Elige al menos un partido.";

// The stored JSON as a scenario, or null when it does not parse or names a
// catalogue party the catalogue does not have.
export function validBuilt(json: string, reference: BuilderReference): BuiltScenario | null {
  const scenario = parseBuiltScenario(json);
  const known = scenario?.parties.every(({ catalogId }) => !catalogId || reference.catalog.has(catalogId));
  return known ? scenario : null;
}

const createSchema = z.object({
  name: simulationName,
  seatTable: z.enum(["2023", "2026"], "Elige el reparto de escaños."),
  parties: z.string().min(1, NO_PARTIES),
  // Present when the votes come from an imported file.
  provinces: z.string().optional(),
});

// Starts a built election, with every province empty or with the votes of an
// imported file, and stores it in the user's profile, where it counts towards
// MAX_SIMULATIONS.
export async function createBuiltAs(
  userId: string | undefined,
  formData: FormData,
  insertIfRoom: InsertIfRoom,
  reference: BuilderReference,
): Promise<SaveState> {
  if (!userId) return { error: signedOut };
  const parsed = createSchema.safeParse(formValues(formData, ["name", "seatTable", "parties", "provinces"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const { name, seatTable, parties, provinces } = parsed.data;

  const broken: SaveState = provinces ? { error: "Los votos importados no son válidos." } : { fieldErrors: { parties: "La lista de partidos no es válida." } };
  let json: string;
  try {
    json = JSON.stringify({ schemaVersion: 1, seatTable, parties: JSON.parse(parties), provinces: provinces ? JSON.parse(provinces) : {} });
  } catch {
    return broken;
  }
  const scenario = validBuilt(json, reference);
  if (!scenario) return broken;
  if (scenario.parties.length === 0) return { fieldErrors: { parties: NO_PARTIES } };

  const id = await insertIfRoom(userId, name, json, "built");
  return id ? { saved: name, id } : { error: full };
}

// The autosave: overwrites the whole scenario of a built election.
export async function saveBuiltDraftAs(
  userId: string | undefined,
  id: string,
  json: string,
  updateOwned: UpdateOwnedBuilt,
  reference: BuilderReference,
  expected: string,
): Promise<DraftState> {
  if (!userId) return { error: signedOut };
  if (!id || !validBuilt(json, reference) || !validBuilt(expected, reference)) return { error: invalid };
  return (await updateOwned(userId, id, json, expected)) ? { saved: true } : { error: conflict };
}
