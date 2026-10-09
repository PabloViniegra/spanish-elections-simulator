import { integer, pgTable, text, timestamp } from "drizzle-orm/pg-core";

// Attempts per key in the current fixed window, shared by every server instance.
export const rateLimit = pgTable("rate_limit", {
  key: text("key").primaryKey(),
  count: integer("count").notNull(),
  windowStart: timestamp("window_start", { withTimezone: true }).notNull(),
});
