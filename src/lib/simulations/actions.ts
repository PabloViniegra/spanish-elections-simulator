"use server";

import { and, eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { simulation } from "@/lib/db/schema";
import type { SaveState } from "./forms";
import { insertSimulationIfRoom, updateOwnedSimulation } from "./queries";
import { saveSimulationAs, updateSimulationAs } from "./save";

export async function saveSimulation(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  const state = await saveSimulationAs(session?.user.id, formData, insertSimulationIfRoom);
  if (state?.saved) revalidatePath("/profile");
  return state;
}

// Renames a saved simulation, or overwrites it with the scenario sent.
export async function updateSimulation(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  const state = await updateSimulationAs(session?.user.id, formData, updateOwnedSimulation);
  if (state?.saved) revalidatePath("/profile");
  return state;
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
