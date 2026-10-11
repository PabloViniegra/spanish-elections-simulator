import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { simulation } from "@/lib/db/schema";
import type { UpdateOwnedBuilt } from "./save";

// Scoped to the owner and to built elections, so an id from someone else or
// of a projected simulation matches nothing.
const ownedBuilt = (userId: string, id: string) =>
  and(eq(simulation.id, id), eq(simulation.userId, userId), eq(simulation.kind, "built"));

export async function findBuilt(userId: string, id: string) {
  const [found] = await db
    .select({ id: simulation.id, name: simulation.name, scenario: simulation.scenario })
    .from(simulation)
    .where(ownedBuilt(userId, id));
  return found ?? null;
}

export const updateOwnedBuilt: UpdateOwnedBuilt = async (userId, id, scenario, expected) => {
  const updated = await db
    .update(simulation)
    .set({ scenario, updatedAt: new Date() })
    .where(and(ownedBuilt(userId, id), eq(simulation.scenario, expected)))
    .returning({ id: simulation.id });
  return updated.length > 0;
};
