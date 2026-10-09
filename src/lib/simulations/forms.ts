import { z } from "zod";
import { restoreScenario } from "@/lib/scenario/restore";
import { NAME_MAX } from "./limits";

export { NAME_MAX, MAX_SIMULATIONS } from "./limits";

export const saveSimulationSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre a la simulación.").max(NAME_MAX, `El nombre no puede superar los ${NAME_MAX} caracteres.`),
  // The scenario as its URL parameter; it must restore like a shared link.
  scenario: z
    .string()
    .max(20_000)
    .refine((param) => restoreScenario(param) !== null, "El escenario no es válido."),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string | undefined>; saved?: string } | undefined;
