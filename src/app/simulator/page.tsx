import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/site-header";
import { SiteFooter } from "@/components/layout/site-footer";
import { SimulatorContainer } from "@/components/simulator/simulator-container";
import { JsonLd } from "@/components/seo/json-ld";
import { getSession } from "@/lib/auth/session";
import { SAVED_PARAM, SCENARIO_PARAM } from "@/lib/scenario/url";
import { simulatorInitialState } from "@/lib/scenario/initial";
import { findSimulation } from "@/lib/simulations/queries";
import { OG_SIZE, SITE_OPEN_GRAPH, SITE_URL } from "@/lib/site";
import { ElectionReference } from "@/components/legal/election-reference";

const metadata: Metadata = {
  title: "Simulador",
  description: "Cambia el porcentaje de voto de cada partido y mira el reparto de los 350 escaños del Congreso, sin cuenta.",
  alternates: { canonical: "/simulator" },
};

type Param = typeof SCENARIO_PARAM | typeof SAVED_PARAM;
type SimulatorPageProps = {
  searchParams: Promise<Partial<Record<Param, string | string[]>>>;
};

async function paramOf(searchParams: SimulatorPageProps["searchParams"], name: Param) {
  const value = (await searchParams)[name];
  return Array.isArray(value) ? value[0] : value;
}

// A shared link previews its own chamber.
export async function generateMetadata({ searchParams }: SimulatorPageProps): Promise<Metadata> {
  const param = await paramOf(searchParams, SCENARIO_PARAM);
  if (!param) return metadata;
  const image = {
    url: `/simulator/og?${SCENARIO_PARAM}=${encodeURIComponent(param)}`,
    ...OG_SIZE,
    alt: "Hemiciclo del Congreso con el reparto de los 350 escaños en este escenario.",
  };
  return { ...metadata, openGraph: { ...SITE_OPEN_GRAPH, images: [image] }, twitter: { card: "summary_large_image", images: [image] } };
}

// Only saved scenarios require an account and are scoped to their owner.
export default async function SimulatorPage({ searchParams }: SimulatorPageProps) {
  const session = await getSession();
  const param = await paramOf(searchParams, SCENARIO_PARAM);
  const savedId = await paramOf(searchParams, SAVED_PARAM);
  const saved = session && param && savedId ? await findSimulation(session.user.id, savedId) : null;
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
              Cambia el voto y mira los 350 escaños del Congreso
            </h1>
            <p className="max-w-xl text-body text-pretty text-ink-muted-80">
              Votos reales de unas generales con el reparto de escaños de referencia. Si cambias un partido, su voto varía en la misma proporción
              en cada provincia.{" "}
              <span className="font-semibold text-ink">Es una simulación, no una previsión.</span>
            </p>
          </div>
        </div>
        <SimulatorContainer signedIn={Boolean(session)} initial={simulatorInitialState(param ?? null)} saved={saved} />
      </main>
      <SiteFooter>
        <ElectionReference /> Es una simulación, no una previsión, y no favorece a ningún partido.
      </SiteFooter>
    </>
  );
}
