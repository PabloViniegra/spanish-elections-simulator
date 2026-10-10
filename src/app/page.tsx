import type { Metadata } from "next";
import { Suspense } from "react";
import { FlashToast } from "@/components/feedback/flash-toast";
import { DhondtExample } from "@/components/home/dhondt-example";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/home-hero";
import { SeatContrast } from "@/components/home/seat-contrast";
import { SessionSiteHeader } from "@/components/home/session-site-header";
import { CtaLinks } from "@/components/home/cta-links";
import { JsonLd } from "@/components/seo/json-ld";
import { getSession } from "@/lib/auth/session";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Simulador de escaños del Congreso · Elecciones generales" },
  description:
    "Simula elecciones generales sin cuenta: cambia el voto de cada partido y mira cómo el método D'Hondt reparte los 350 escaños del Congreso.",
  alternates: { canonical: "/" },
};

async function HomeActions() {
  const session = await getSession();
  return <CtaLinks tone="dark" withLogin={!session} />;
}

async function AccountDeletedNotice({ searchParams }: Pick<PageProps<"/">, "searchParams">) {
  const { "account-deleted": accountDeleted } = await searchParams;
  return accountDeleted ? <FlashToast title="Cuenta eliminada" description="Hemos borrado tus datos y te hemos enviado un correo de confirmación." /> : null;
}

export default function Home({ searchParams }: PageProps<"/">) {
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "es" }} />
      <SessionSiteHeader current="home" />
      <main id="contenido" className="flex-1">
        <HomeHero actions={<Suspense fallback={<CtaLinks tone="dark" withLogin={false} />}><HomeActions /></Suspense>} />
        <SeatContrast />
        <DhondtExample />
        <HomeClosing />
      </main>
      <Suspense fallback={null}><AccountDeletedNotice searchParams={searchParams} /></Suspense>
    </>
  );
}
