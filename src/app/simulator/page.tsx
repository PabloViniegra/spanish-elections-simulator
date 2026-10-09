import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SimulatorContainer } from "@/components/simulator/simulator-container";
import { JsonLd } from "@/components/seo/json-ld";
import { withNext } from "@/lib/auth/next-path";
import { getSession } from "@/lib/auth/session";
import { SCENARIO_PARAM } from "@/lib/scenario/url";
import { simulatorInitialState } from "@/lib/scenario/initial";
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
  const params = await searchParams;
  const shared = params[SCENARIO_PARAM];
  const param = Array.isArray(shared) ? shared[0] : shared;
  if (!session && !param) redirect(withNext("/login", "/simulator"));
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
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-6 sm:px-8 sm:py-8">
            <h1 className="text-display-lg text-balance max-sm:text-[1.75rem]">
              {session ? "Cambia el voto y mira los 350 escaños del 29 de noviembre" : "Así quedarían los 350 escaños del 29 de noviembre con este escenario"}
            </h1>
            <p className="max-w-xl text-body text-pretty text-ink-muted-80">
              Votos reales de unas generales con los escaños de 2026. Si cambias un partido, su voto varía en la misma proporción
              en cada provincia.{" "}
              <span className="font-semibold text-ink">Es una simulación, no una previsión.</span>
            </p>
          </div>
        </div>
        <SimulatorContainer signedIn={Boolean(session)} initial={simulatorInitialState(param ?? null)} />
      </main>
      <SiteFooter>
        Escaños del 29 de noviembre de 2026 según el Real Decreto 806/2026. Es una simulación, no una previsión, y no favorece a
        ningún partido.
      </SiteFooter>
    </>
  );
}
