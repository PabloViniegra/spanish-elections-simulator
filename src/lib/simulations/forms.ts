import { z } from "zod";
import { restoreScenario } from "@/lib/scenario/restore";

export const NAME_MAX = 80;

export const saveSimulationSchema = z.object({
  name: z.string().trim().min(1, "Ponle un nombre al simulacro.").max(NAME_MAX, `El nombre no puede superar los ${NAME_MAX} caracteres.`),
  // The scenario as its URL parameter; it must restore like a shared link.
  scenario: z
    .string()
    .max(20_000)
    .refine((param) => restoreScenario(param) !== null, "El escenario no es válido."),
});

export type SaveState = { error?: string; fieldErrors?: Record<string, string | undefined>; saved?: string } | undefined;
