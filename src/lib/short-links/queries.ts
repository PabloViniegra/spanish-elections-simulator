import { eq } from "drizzle-orm";
import { db } from "@/lib/db/client";
import { shortLink } from "@/lib/db/schema";
import { shortLinkId } from "./id";

export async function findShortLink(id: string) {
  const [found] = await db.select({ scenario: shortLink.scenario }).from(shortLink).where(eq(shortLink.id, id));
  return found?.scenario ?? null;
}

// The id of the short link to `scenario`, or null if another scenario holds it.
export async function storeShortLink(scenario: string) {
  const id = await shortLinkId(scenario);
  await db.insert(shortLink).values({ id, scenario }).onConflictDoNothing();
  return (await findShortLink(id)) === scenario ? id : null;
}
