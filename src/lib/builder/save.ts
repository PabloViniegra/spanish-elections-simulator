import { z } from "zod";
import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { MAX_SIMULATIONS, type SaveState, simulationName } from "@/lib/simulations/forms";
import type { InsertIfRoom } from "@/lib/simulations/save";
import type { BuilderReference } from "./allocate";
import { NO_PARTIES } from "./messages";
import { validBuilt } from "./schema";

// Compare-and-swap against the revision loaded by this editor; the new
// revision, or null when it changed or the election is not the user's.
export type UpdateOwnedBuilt = (userId: string, id: string, scenario: string, revision: number) => Promise<number | null>;

export type DraftState = { saved: true; revision: number } | { error: string };

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";
const full = `Ya tienes ${MAX_SIMULATIONS} simulaciones guardadas. Borra alguna desde tu perfil para crear otra.`;
const conflict = "No se han guardado los cambios: estas elecciones han cambiado en otra pestaña o ya no están en tu perfil. Conserva tus cambios antes de recargar.";
const invalid = "Los datos de las elecciones no son válidos. Recarga la página e inténtalo de nuevo.";

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
  revision: number,
): Promise<DraftState> {
  if (!userId) return { error: signedOut };
  if (!id || !validBuilt(json, reference)) return { error: invalid };
  const next = await updateOwned(userId, id, json, revision);
  return next === null ? { error: conflict } : { saved: true, revision: next };
}
