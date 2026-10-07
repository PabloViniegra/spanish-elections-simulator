import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/home/site-header";
import { SimulatorContainer } from "@/components/simulator/simulator-container";
import { JsonLd } from "@/components/seo/json-ld";
import { auth } from "@/lib/auth/auth";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Simulador",
  description: "Cambia el porcentaje de voto de cada partido y mira el reparto de los 350 escaños del 29 de noviembre de 2026.",
  alternates: { canonical: "/simulador" },
};

export default async function SimulatorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "WebApplication",
          name: "Simulador de escaños del Congreso",
          url: `${SITE_URL}/simulador`,
          applicationCategory: "UtilitiesApplication",
          operatingSystem: "Any",
          inLanguage: "es",
        }}
      />
      <SiteHeader username={session?.user.name} current="simulador" />
      <main id="contenido" className="flex-1">
        <div className="bg-canvas-parchment">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-10 sm:px-8">
            <h1 className="text-display-lg text-balance">Cambia el voto y mira los 350 escaños del 29 de noviembre</h1>
            <p className="max-w-xl text-body text-pretty text-ink-muted-80">
              Partimos de los votos de 2023, provincia a provincia, con los escaños del Real Decreto 806/2026. También puedes
              partir de las generales de 2016 o de 2019. Si cambias un partido, su voto varía en la misma proporción en cada
              provincia.
            </p>
            <p className="max-w-xl text-caption font-semibold">Es una simulación, no una previsión.</p>
          </div>
        </div>
        <SimulatorContainer />
      </main>
    </>
  );
}
