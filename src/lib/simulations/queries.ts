import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type ScenarioKind, simulation, user } from "@/lib/db/schema";
import { MAX_SIMULATIONS } from "./forms";
import type { InsertIfRoom, UpdateOwned } from "./save";

// Scoped to the owner, so an id from someone else matches nothing.
const owned = (userId: string, id: string) => and(eq(simulation.id, id), eq(simulation.userId, userId));

export function listSimulations(userId: string) {
  return db.select().from(simulation).where(eq(simulation.userId, userId)).orderBy(desc(simulation.createdAt));
}

// The saved simulation a scenario was opened from, if the user still has it.
export async function findSimulation(userId: string, id: string) {
  const [found] = await db
    .select({ id: simulation.id, name: simulation.name })
    .from(simulation)
    .where(and(owned(userId, id), eq(simulation.kind, "projection")));
  return found ?? null;
}

// One transaction: locking the owner row queues concurrent saves, and the
// insert's fresh snapshot then counts the saves committed before it.
export const insertSimulationIfRoom: InsertIfRoom = async (userId, name, scenario, kind: ScenarioKind = "projection") => {
  const id = crypto.randomUUID();
  const [, inserted] = await db.batch([
    db.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update"),
    db.execute(sql`
      insert into ${simulation} (id, user_id, name, kind, scenario)
      select ${id}, ${userId}, ${name}, ${kind}, ${scenario}
      where (select count(*) from ${simulation} where ${simulation.userId} = ${userId}) < ${MAX_SIMULATIONS}
      returning id
    `),
  ]);
  return inserted.rows.length > 0 ? id : null;
};

// Renames any kind, but only overwrites a projection with a projection.
export const updateOwnedSimulation: UpdateOwned = async (userId, id, values) => {
  const updated = await db
    .update(simulation)
    .set({ ...values, updatedAt: new Date() })
    .where(values.scenario === undefined ? owned(userId, id) : and(owned(userId, id), eq(simulation.kind, "projection")))
    .returning({ id: simulation.id });
  return updated.length > 0;
};
