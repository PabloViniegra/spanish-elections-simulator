import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// A shared scenario behind a short address. The id derives from the scenario,
// so sharing the same one again reuses its link.
export const shortLink = pgTable("short_link", {
  id: text("id").primaryKey(),
  scenario: text("scenario").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});
