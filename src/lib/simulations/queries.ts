import { desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { simulation, user } from "@/lib/db/schema";
import { MAX_SIMULATIONS } from "./forms";
import type { InsertIfRoom } from "./save";

export function listSimulations(userId: string) {
  return db.select().from(simulation).where(eq(simulation.userId, userId)).orderBy(desc(simulation.createdAt));
}

// One transaction: locking the owner row queues concurrent saves, and the
// insert's fresh snapshot then counts the saves committed before it.
export const insertSimulationIfRoom: InsertIfRoom = async (userId, name, scenario) => {
  const [, inserted] = await db.batch([
    db.select({ id: user.id }).from(user).where(eq(user.id, userId)).for("update"),
    db.execute(sql`
      insert into ${simulation} (id, user_id, name, scenario)
      select ${crypto.randomUUID()}, ${userId}, ${name}, ${scenario}
      where (select count(*) from ${simulation} where ${simulation.userId} = ${userId}) < ${MAX_SIMULATIONS}
      returning id
    `),
  ]);
  return inserted.rows.length > 0;
};
