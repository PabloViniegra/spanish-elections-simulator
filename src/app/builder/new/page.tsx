import type { Metadata } from "next";
import { BuilderSetupContainer } from "@/components/builder/builder-setup-container";
import { SiteHeader } from "@/components/home/site-header";
import { sectionTitle } from "@/components/home/type";
import { requireSession } from "@/lib/auth/session";
import { catalog } from "@/lib/builder/reference";

export const metadata: Metadata = { title: "Construir unas elecciones", robots: { index: false, follow: false } };

export default async function NewBuilderPage() {
  const { user } = await requireSession("/builder/new");
  return (
    <>
      <SiteHeader username={user.name} current="builder" />
      <main id="contenido" className="flex-1">
        <div className="bg-canvas-parchment">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 pt-14 pb-12 sm:px-8 lg:pt-20 lg:pb-16">
            <h1 className={`hero-rise [--c:0] ${sectionTitle}`}>Construye unas elecciones</h1>
            <p className="hero-rise max-w-[60ch] text-lead-airy text-ink-muted-80 [--c:1]">
              Elige los partidos y el reparto de escaños. Después irás provincia a provincia escribiendo los votos y verás cómo se reparten los escaños.
            </p>
            <p className="text-caption text-ink-muted-80">Son unas elecciones construidas a mano, no una previsión.</p>
          </div>
        </div>
        <div className="mx-auto max-w-content px-5 py-12 sm:px-8 lg:py-16">
          <BuilderSetupContainer catalog={catalog} />
        </div>
      </main>
    </>
  );
}
