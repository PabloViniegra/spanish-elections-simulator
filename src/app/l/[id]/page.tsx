import type { Metadata } from "next";
import { notFound, permanentRedirect } from "next/navigation";
import { BuiltResultsContainer } from "@/components/builder/built-results-container";
import { SessionSiteHeader } from "@/components/home/session-site-header";
import { isComplete } from "@/lib/builder/allocate";
import { builderReference } from "@/lib/builder/reference";
import { validBuilt } from "@/lib/builder/schema";
import { simulatorHref } from "@/lib/scenario/address";
import { findShortLink } from "@/lib/short-links/queries";

export const metadata: Metadata = { title: "Elecciones construidas", robots: { index: false, follow: false } };

// A built election has no public address, so the short link shows it here, read-only.
export default async function ShortLinkPage({ params }: PageProps<"/l/[id]">) {
  const { id } = await params;
  const scenario = await findShortLink(id);
  if (scenario) permanentRedirect(simulatorHref(scenario));
  const stored = await findShortLink(id, "built");
  const built = stored && validBuilt(stored, builderReference);
  if (!built || !isComplete(built, builderReference)) notFound();
  return (
    <>
      <SessionSiteHeader current="builder" />
      <main id="contenido" className="flex-1">
        <BuiltResultsContainer scenario={built} />
      </main>
    </>
  );
}
