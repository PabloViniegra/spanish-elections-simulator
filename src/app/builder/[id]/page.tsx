import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { BuilderWizardContainer } from "@/components/builder/builder-wizard-container";
import { SiteHeader } from "@/components/home/site-header";
import { requireSession } from "@/lib/auth/session";
import { builderHref } from "@/lib/builder/address";
import { nextOpen } from "@/lib/builder/edit";
import { findBuilt } from "@/lib/builder/queries";
import { builderReference } from "@/lib/builder/reference";
import { validBuilt } from "@/lib/builder/schema";

export const metadata: Metadata = { title: "Construir unas elecciones", robots: { index: false, follow: false } };

type BuilderPageProps = {
  params: Promise<{ id: string }>;
};

// Only the owner reaches the wizard; anyone else, like a missing id, gets a 404.
export default async function BuilderPage({ params }: BuilderPageProps) {
  const { id } = await params;
  const { user } = await requireSession(builderHref(id));
  const found = await findBuilt(user.id, id);
  const scenario = found && validBuilt(found.scenario, builderReference);
  if (!found || !scenario) notFound();
  return (
    <>
      <SiteHeader username={user.name} current="builder" />
      <main id="contenido" className="flex-1">
        <BuilderWizardContainer key={found.id} id={found.id} name={found.name} initial={scenario} revision={found.revision} start={nextOpen(scenario, builderReference)} />
      </main>
    </>
  );
}
