import { lt, sql } from "drizzle-orm";
import { after } from "next/server";
import { db } from "@/lib/db/client";
import { rateLimit } from "@/lib/db/schema";
import type { RateRule } from "./rules";

// Counts one attempt against `key` in a single statement, so concurrent
// attempts cannot all pass on a stale count. Shaped like Better Auth's
// rate-limit storage so its own endpoints share the table.
export async function consume(key: string, rule: RateRule) {
  const expired = sql`${rateLimit.windowStart} <= now() - make_interval(secs => ${rule.window})`;
  const [row] = await db
    .insert(rateLimit)
    .values({ key, count: 1, windowStart: sql`now()` })
    .onConflictDoUpdate({
      target: rateLimit.key,
      set: {
        count: sql`case when ${expired} then 1 else ${rateLimit.count} + 1 end`,
        windowStart: sql`case when ${expired} then now() else ${rateLimit.windowStart} end`,
      },
    })
    .returning({
      count: rateLimit.count,
      retryAfter: sql<number>`ceil(extract(epoch from ${rateLimit.windowStart} + make_interval(secs => ${rule.window}) - now()))::int`,
    });
  // A fresh window is a cheap moment to drop rows idle for longer than any rule.
  if (row.count === 1) after(() => db.delete(rateLimit).where(lt(rateLimit.windowStart, sql`now() - interval '1 day'`)));
  const allowed = row.count <= rule.max;
  return { allowed, retryAfter: allowed ? null : Math.max(row.retryAfter, 1) };
}
