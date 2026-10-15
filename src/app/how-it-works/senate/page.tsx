import type { Metadata } from "next";
import { SenateBallot } from "@/components/explainer/senate/senate-ballot";
import { SenateClosing } from "@/components/explainer/senate/senate-closing";
import { SenateDesignated } from "@/components/explainer/senate/senate-designated";
import { SenateHero } from "@/components/explainer/senate/senate-hero";
import { SenateMap } from "@/components/explainer/senate/senate-map";
import { SenateRecount } from "@/components/explainer/senate/senate-recount";
import { SenateSpecialCases } from "@/components/explainer/senate/senate-special-cases";
import { SenateTakeaways } from "@/components/explainer/senate/senate-takeaways";
import { SessionSiteHeader } from "@/components/home/session-site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: "Cómo funciona el Senado",
  description: "Cómo se eligen los senadores: la papeleta sepia, los 4 escaños por provincia, las islas y los senadores que designan las comunidades.",
  alternates: { canonical: "/how-it-works/senate" },
};

export default function SenateExplainerPage() {
  return (
    <>
      <JsonLd
        data={{
          "@context": "https://schema.org",
          "@type": "BreadcrumbList",
          itemListElement: [
            { "@type": "ListItem", position: 1, name: "Inicio", item: SITE_URL },
            { "@type": "ListItem", position: 2, name: "Cómo funciona", item: `${SITE_URL}/how-it-works` },
            { "@type": "ListItem", position: 3, name: "Senado", item: `${SITE_URL}/how-it-works/senate` },
          ],
        }}
      />
      <div aria-hidden="true" className="read-progress fixed inset-x-0 top-0 z-50 h-0.5 bg-primary" />
      <SessionSiteHeader current="senate" />
      <main id="contenido" className="flex-1">
        <SenateHero />
        <SenateMap />
        <SenateBallot />
        <SenateRecount />
        <SenateSpecialCases />
        <SenateDesignated />
        <SenateTakeaways />
        <SenateClosing />
      </main>
    </>
  );
}
