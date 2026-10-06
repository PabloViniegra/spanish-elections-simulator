import type { Metadata } from "next";
import { headers } from "next/headers";
import { SiteHeader } from "@/components/home/site-header";
import { SimulatorContainer } from "@/components/simulator/simulator-container";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Simulador",
  description: "Cambia el porcentaje de voto de cada partido y mira el reparto de los 350 escaños del 29 de noviembre de 2026.",
};

export default async function SimulatorPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <SiteHeader username={session?.user.name} />
      <main className="flex-1">
        <div className="bg-canvas-parchment">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 py-10 sm:px-8">
            <h1 className="text-display-lg text-balance">Reparte los 350 escaños del 29 de noviembre</h1>
            <p className="max-w-prose text-body text-pretty text-ink-muted-80">
              Parte de los votos de las generales de 2023, provincia a provincia, y aplica los escaños que fija el Real
              Decreto 806/2026. Cambia el porcentaje de cada partido: el voto se mueve en la misma proporción en todas
              las provincias.
            </p>
            <p className="max-w-prose text-caption font-semibold">Es una simulación, no una previsión.</p>
          </div>
        </div>
        <SimulatorContainer />
      </main>
    </>
  );
}
