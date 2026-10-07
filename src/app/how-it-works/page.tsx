import type { Metadata } from "next";
import { BallotCards } from "@/components/explainer/ballot-cards";
import { ConstituencyMap } from "@/components/explainer/constituency-map";
import { DhondtAuction } from "@/components/explainer/dhondt-auction";
import { ExplainerClosing } from "@/components/explainer/explainer-closing";
import { ExplainerHero } from "@/components/explainer/explainer-hero";
import { ExplainerTakeaways } from "@/components/explainer/explainer-takeaways";
import { SeatLadder } from "@/components/explainer/seat-ladder";
import { ThresholdBars } from "@/components/explainer/threshold-bars";
import { SiteHeader } from "@/components/home/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { getSession } from "@/lib/auth/session";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona",
  description: "Cómo se convierten los votos en los 350 escaños del Congreso, explicado paso a paso y sin tecnicismos.",
  alternates: { canonical: "/how-it-works" },
};

// FR-14: the electoral system in plain language, in the order a vote travels.
export default async function ExplainerPage() {
  const session = await getSession();
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Cómo funciona", item: `${SITE_URL}/how-it-works` },
          ],
        }}
      />
      <div aria-hidden="true" className="read-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-primary" />
      <SiteHeader username={session?.user.name} current="how-it-works" />
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
