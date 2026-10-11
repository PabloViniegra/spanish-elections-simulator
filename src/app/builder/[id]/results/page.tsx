import type { Metadata } from "next";
import { notFound, redirect } from "next/navigation";
import { BuiltResultsContainer } from "@/components/builder/built-results-container";
import { SiteHeader } from "@/components/home/site-header";
import { requireSession } from "@/lib/auth/session";
import { builderHref, builderResultsHref } from "@/lib/builder/address";
import { isComplete } from "@/lib/builder/allocate";
import { findBuilt } from "@/lib/builder/queries";
import { builderReference } from "@/lib/builder/reference";
import { validBuilt } from "@/lib/builder/save";

export const metadata: Metadata = { title: "Resultados de tus elecciones", robots: { index: false, follow: false } };

type BuiltResultsPageProps = {
  params: Promise<{ id: string }>;
};

// The Congreso, once all 52 provinces are complete; until then, the wizard.
export default async function BuiltResultsPage({ params }: BuiltResultsPageProps) {
  const { id } = await params;
  const { user } = await requireSession(builderResultsHref(id));
  const found = await findBuilt(user.id, id);
  const scenario = found && validBuilt(found.scenario, builderReference);
  if (!found || !scenario) notFound();
  if (!isComplete(scenario, builderReference)) redirect(builderHref(found.id));
  return (
    <>
      <SiteHeader username={user.name} current="builder" />
      <main id="contenido" className="flex-1">
        <BuiltResultsContainer scenario={scenario} name={found.name} ownerId={found.id} />
      </main>
    </>
  );
}
