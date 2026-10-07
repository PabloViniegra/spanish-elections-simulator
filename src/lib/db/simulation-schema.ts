import { index, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// A scenario a user saved, kept as its URL parameter so old saves migrate
// with old links (NFR-10).
export const simulation = pgTable(
  "simulation",
  {
    id: text("id")
      .primaryKey()
      .$defaultFn(() => crypto.randomUUID()),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    scenario: text("scenario").notNull(),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => [index("simulation_userId_idx").on(table.userId)],
);
