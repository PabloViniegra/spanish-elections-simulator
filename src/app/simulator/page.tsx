import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/home/site-header";
import { SimulatorContainer } from "@/components/simulator/simulator-container";
import { JsonLd } from "@/components/seo/json-ld";
import { withNext } from "@/lib/auth/next-path";
import { getSession } from "@/lib/auth/session";
import { SCENARIO_PARAM } from "@/lib/scenario/url";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Simulador",
  description: "Cambia el porcentaje de voto de cada partido y mira el reparto de los 350 escaños del 29 de noviembre de 2026.",
  alternates: { canonical: "/simulator" },
};

type SimulatorPageProps = {
  searchParams: Promise<Partial<Record<typeof SCENARIO_PARAM, string | string[]>>>;
};

// Simulating takes an account; a shared link stays public, read-only.
export default async function SimulatorPage({ searchParams }: SimulatorPageProps) {
  const session = await getSession();
  if (!session && !(await searchParams)[SCENARIO_PARAM]) redirect(withNext("/login", "/simulator"));
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulador de escaños del Congreso",
          url: `${SITE_URL}/simulator`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: "es",
        }}
      />
      <SiteHeader username={session?.user.name} current="simulator" />
      <main id="contenido" className="flex-1">
        <div className="bg-canvas-parchment">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-10 sm:px-8">
            <h1 className="text-display-lg text-balance">
              {session ? "Cambia el voto y mira los 350 escaños del 29 de noviembre" : "Así quedarían los 350 escaños del 29 de noviembre con este escenario"}
            </h1>
            <p className="max-w-xl text-body text-pretty text-ink-muted-80">
              Partimos de los votos de 2023, provincia a provincia, con los escaños del Real Decreto 806/2026. También puedes
              partir de las generales de 2016 o de 2019. Si cambias un partido, su voto varía en la misma proporción en cada
              provincia.
            </p>
            <p className="max-w-xl text-caption font-semibold">Es una simulación, no una previsión.</p>
          </div>
        </div>
        <SimulatorContainer signedIn={Boolean(session)} />
      </main>
    </>
  );
}
