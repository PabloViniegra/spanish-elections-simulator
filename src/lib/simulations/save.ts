import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { MAX_SIMULATIONS, saveSimulationSchema, type SaveState } from "./forms";

// Stores a simulation unless its owner already has MAX_SIMULATIONS; false when full.
export type InsertIfRoom = (userId: string, name: string, scenario: string) => Promise<boolean>;

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";
const full = `Ya tienes ${MAX_SIMULATIONS} simulaciones guardadas. Borra alguna desde tu perfil para guardar otra.`;

export async function saveSimulationAs(userId: string | undefined, formData: FormData, insertIfRoom: InsertIfRoom): Promise<SaveState> {
  if (!userId) return { error: signedOut };
  const parsed = saveSimulationSchema.safeParse(formValues(formData, ["name", "scenario"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  if (!(await insertIfRoom(userId, parsed.data.name, parsed.data.scenario))) return { error: full };
  return { saved: parsed.data.name };
}
