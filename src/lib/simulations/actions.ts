"use server";

import { and, eq, sql } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { z } from "zod";
import { fieldErrorsOf, formValues } from "@/lib/auth/forms";
import { getSession } from "@/lib/auth/session";
import { db } from "@/lib/db/client";
import { simulation, user } from "@/lib/db/schema";
import { MAX_SIMULATIONS, saveSimulationSchema, type SaveState } from "./forms";

const signedOut = "Tu sesión ha caducado. Inicia sesión de nuevo para guardar.";

export async function saveSimulation(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  if (!session) return { error: signedOut };
  const parsed = saveSimulationSchema.safeParse(formValues(formData, ["name", "scenario"]));
  if (!parsed.success) return { fieldErrors: fieldErrorsOf(parsed.error) };
  const userId = session.user.id;
  // One transaction: locking the owner row queues concurrent saves, and the
  // insert's fresh snapshot then counts the saves committed before it.
  const [, inserted] = await db.batch([
    db.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update"),
    db.execute(sql`
      insert into ${simulation} (id, user_id, name, scenario)
      select ${crypto.randomUUID()}, ${userId}, ${parsed.data.name}, ${parsed.data.scenario}
      where (select count(*) from ${simulation} where ${simulation.userId} = ${userId}) < ${MAX_SIMULATIONS}
      returning id
    `),
  ]);
  if (inserted.rows.length === 0) {
    return { error: `Ya tienes ${MAX_SIMULATIONS} simulaciones guardadas. Borra alguna desde tu perfil para guardar otra.` };
  }

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
