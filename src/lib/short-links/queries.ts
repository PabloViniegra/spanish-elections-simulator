import { and, eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { type ScenarioKind, shortLink } from "@/lib/db/schema";
import { shortLinkId } from "./id";

export async function findShortLink(id: string, kind: ScenarioKind = "projection") {
  const [found] = await db
    .select({ scenario: shortLink.scenario })
    .from(shortLink)
    .where(and(eq(shortLink.id, id), eq(shortLink.kind, kind)));
  return found?.scenario ?? null;
}

// The id of the short link to `scenario`, or null if another scenario holds it.
export async function storeShortLink(scenario: string, kind: ScenarioKind = "projection") {
  const id = await shortLinkId(scenario);
  await db.insert(shortLink).values({ id, kind, scenario }).onConflictDoNothing();
  return (await findShortLink(id, kind)) === scenario ? id : null;
}
