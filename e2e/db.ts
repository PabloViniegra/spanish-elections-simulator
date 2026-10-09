import { eq, sql } from "drizzle-orm";
import { db, LOCAL_DB_HOST } from "../src/lib/db/client";
import { user } from "../src/lib/db/schema";

// Starts from no accounts, sessions or rate-limit counts. Refuses any database
// but the throwaway one, so a misconfigured run cannot wipe real data.
export async function resetDatabase() {
  if (new URL(process.env.DATABASE_URI ?? "").hostname !== LOCAL_DB_HOST) {
    throw new Error("The end-to-end tests only run against compose.e2e.yml.");
  }
  await db.execute(sql`truncate table "user", "verification", "rate_limit" cascade`);
}

// Stands in for following the link in the confirmation email.
export async function confirmEmail(email: string) {
  await db.update(user).set({ emailVerified: true }).where(eq(user.email, email));
}
