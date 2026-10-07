"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { simulation } from "@/lib/db/schema";
import { saveSimulationSchema, type SaveState } from "./forms";

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";

export async function saveSimulation(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  if (!session) return { error: signedOut };
  const parsed = saveSimulationSchema.safeParse(formValues(formData, ["name", "scenario"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };

  await db.insert(simulation).values({ userId: session.user.id, name: parsed.data.name, scenario: parsed.data.scenario });
  revalidatePath("/profile");
  return { saved: parsed.data.name };
}

// True once the simulation is gone.
export async function deleteSimulation(id: string) {
  const session = await getSession();
  if (!session) return false;
  // Scoped to the owner, so an id from someone else deletes nothing.
  const deleted = await db
    .delete(simulation)
    .where(and(eq(simulation.id, z.string().parse(id)), eq(simulation.userId, session.user.id)))
    .returning({ id: simulation.id });
  revalidatePath("/profile");
  return deleted.length > 0;
}
