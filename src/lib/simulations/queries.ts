import { desc, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { simulation } from "@/lib/db/schema";

export function listSimulations(userId: string) {
  return db.select().from(simulation).where(eq(simulation.userId, userId)).orderBy(desc(simulation.createdAt));
}
