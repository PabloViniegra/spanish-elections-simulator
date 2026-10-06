import type { Metadata } from "next";
import { headers } from "next/headers";
import { BallotCards } from "@/components/explainer/ballot-cards";
import { ConstituencyMap } from "@/components/explainer/constituency-map";
import { DhondtAuction } from "@/components/explainer/dhondt-auction";
import { ExplainerClosing } from "@/components/explainer/explainer-closing";
import { ExplainerHero } from "@/components/explainer/explainer-hero";
import { ExplainerTakeaways } from "@/components/explainer/explainer-takeaways";
import { SeatLadder } from "@/components/explainer/seat-ladder";
import { ThresholdBars } from "@/components/explainer/threshold-bars";
import { SiteHeader } from "@/components/home/site-header";
import { auth } from "@/lib/auth/auth";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Cómo se convierten los votos en los 350 escaños del Congreso, explicado paso a paso y sin tecnicismos.",
};

// FR-14: the electoral system in plain language, in the order a vote travels.
export default async function ExplainerPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  return (
    <>
      <div aria-hidden="true" className="read-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-primary" />
      <SiteHeader username={session?.user.name} current="como-funciona" />
      <main id="contenido" className="flex-1">
        <ExplainerHero />
        <ConstituencyMap />
        <SeatLadder />
        <BallotCards />
        <ThresholdBars />
        <DhondtAuction />
        <ExplainerTakeaways />
        <ExplainerClosing />
      </main>
    </>
  );
}
