import type { Metadata } from "next";
import { BuilderSetupContainer } from "@/components/builder/builder-setup-container";
import { BuilderIntro } from "@/components/builder/builder-intro";
import { SiteHeader } from "@/components/home/site-header";
import { requireSession } from "@/lib/auth/session";
import { catalog } from "@/lib/builder/reference";

export const metadata: Metadata = { title: "Construir unas elecciones", robots: { index: false, follow: false } };

export default async function NewBuilderPage() {
  const { user } = await requireSession("/builder/new");
  return (
    <>
      <SiteHeader username={user.name} current="builder" />
      <main id="contenido" className="flex-1">
        <BuilderIntro />
        <div className="mx-auto max-w-content px-5 py-12 sm:px-8 lg:py-16">
          <BuilderSetupContainer catalog={catalog} />
        </div>
      </main>
    </>
  );
}
