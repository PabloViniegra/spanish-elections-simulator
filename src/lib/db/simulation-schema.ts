import { index, integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";
import { user } from "./auth-schema";

// What a saved or shared scenario holds: a projection is its URL parameter,
// so old saves migrate with old links (NFR-10); a built election is the JSON
// of the election builder.
export const scenarioKinds = ["projection", "built"] as const;
export type ScenarioKind = (typeof scenarioKinds)[number];

// A scenario a user saved.
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
    kind: text("kind", { enum: scenarioKinds }).notNull().default("projection"),
    scenario: text("scenario").notNull(),
    // Bumped by each autosave of a built election, so a stale tab is told
    // apart without sending back the whole scenario it started from.
    revision: integer("revision").notNull().default(0),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    // Null until it is renamed or its scenario overwritten.
    updatedAt: timestamp("updated_at"),
  },
  (table) => [index("simulation_userId_idx").on(table.userId)],
);
