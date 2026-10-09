import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { MAX_SIMULATIONS, saveSimulationSchema, type SaveState, updateSimulationSchema } from "./forms";

// Stores a simulation unless its owner already has MAX_SIMULATIONS; its id, or null when full.
export type InsertIfRoom = (userId: string, name: string, scenario: string) => Promise<string | null>;

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";
const full = `Ya tienes ${MAX_SIMULATIONS} simulaciones guardadas. Borra alguna desde tu perfil para guardar otra.`;

export async function saveSimulationAs(userId: string | undefined, formData: FormData, insertIfRoom: InsertIfRoom): Promise<SaveState> {
  if (!userId) return { error: signedOut };
  const parsed = saveSimulationSchema.safeParse(formValues(formData, ["name", "scenario"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const id = await insertIfRoom(userId, parsed.data.name, parsed.data.scenario);
  return id ? { saved: parsed.data.name, id } : { error: full };
}

// Renames a simulation the user owns, or overwrites its scenario too; false when it is not theirs or is gone.
export type UpdateOwned = (userId: string, id: string, values: { name: string; scenario?: string }) => Promise<boolean>;

const gone = "Esta simulación ya no está en tu perfil. Guárdala como nueva.";

export async function updateSimulationAs(userId: string | undefined, formData: FormData, updateOwned: UpdateOwned): Promise<SaveState> {
  if (!userId) return { error: signedOut };
  const values = formValues(formData, ["id", "name", "scenario"]);
  const parsed = updateSimulationSchema.safeParse({ ...values, scenario: values.scenario || undefined });
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const { id, name, scenario } = parsed.data;
  if (!(await updateOwned(userId, id, { name, scenario }))) return { error: gone };
  return { saved: name, id };
}
