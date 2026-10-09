import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { simulation, user } from "@/lib/db/schema";
import { MAX_SIMULATIONS } from "./forms";
import type { InsertIfRoom, UpdateOwned } from "./save";

// Scoped to the owner, so an id from someone else matches nothing.
const owned = (userId: string, id: string) => and(eq(simulation.id, id), eq(simulation.userId, userId));

export function listSimulations(userId: string) {
  return db.select().from(simulation).where(eq(simulation.userId, userId)).orderBy(desc(simulation.createdAt));
}

// The saved simulation a scenario was opened from, if the user still has it.
export async function findSimulation(userId: string, id: string) {
  const [found] = await db.select({ id: simulation.id, name: simulation.name }).from(simulation).where(owned(userId, id));
  return found ?? null;
}

// One transaction: locking the owner row queues concurrent saves, and the
// insert's fresh snapshot then counts the saves committed before it.
export const insertSimulationIfRoom: InsertIfRoom = async (userId, name, scenario) => {
  const id = crypto.randomUUID();
  const [, inserted] = await db.batch([
    db.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update"),
    db.execute(sql`
      insert into ${simulation} (id, user_id, name, scenario)
      select ${id}, ${userId}, ${name}, ${scenario}
      where (select count(*) from ${simulation} where ${simulation.userId} = ${userId}) < ${MAX_SIMULATIONS}
      returning id
    `),
  ]);
  return inserted.rows.length > 0 ? id : null;
};

export const updateOwnedSimulation: UpdateOwned = async (userId, id, values) => {
  const updated = await db
    .update(simulation)
    .set({ ...values, updatedAt: new Date() })
    .where(owned(userId, id))
    .returning({ id: simulation.id });
  return updated.length > 0;
};
