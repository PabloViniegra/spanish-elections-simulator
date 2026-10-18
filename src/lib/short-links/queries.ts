import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type ScenarioKind, shortLink } from "@/lib/db/schema";
import { shortLinkId } from "./id";

const byId = (id: string) =>
  db.select({ kind: shortLink.kind, scenario: shortLink.scenario }).from(shortLink).where(eq(shortLink.id, id));

// The id is the primary key, so one lookup also tells which kind of scenario it holds.
export async function findShortLink(id: string) {
  const [found] = await byId(id);
  return found ?? null;
}

// The id of the short link to `scenario`, or null if another scenario holds it.
export async function storeShortLink(scenario: string, kind: ScenarioKind = "projection") {
  const id = await shortLinkId(scenario);
  // One round trip: the batch runs in a transaction, so the select sees the row just inserted.
  const [, [found]] = await db.batch([db.insert(shortLink).values({ id, kind, scenario }).onConflictDoNothing(), byId(id)]);
  return found?.kind === kind && found.scenario === scenario ? id : null;
}
