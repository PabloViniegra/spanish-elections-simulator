import type { Metadata } from "next";
import { headers } from "next/headers";
import { DhondtExample } from "@/components/home/dhondt-example";
import { HomeClosing } from "@/components/home/home-closing";
import { HomeHero } from "@/components/home/home-hero";
import { SeatContrast } from "@/components/home/seat-contrast";
import { SiteHeader } from "@/components/home/site-header";
import { JsonLd } from "@/components/seo/json-ld";
import { auth } from "@/lib/auth/auth";
import { SITE_NAME, SITE_URL } from "@/lib/site";

export const metadata: Metadata = {
  title: { absolute: "Simulador de escaños del Congreso · Elecciones 29 de noviembre de 2026" },
  description:
    "Simula las elecciones generales del 29 de noviembre de 2026: cambia el voto de cada partido y mira cómo el método D'Hondt reparte los 350 escaños.",
  alternates: { canonical: "/" },
};

export default async function Home() {
  const session = await auth.api.getSession({ headers: await headers() });
  const username = session?.user.name;
  return (
    <>
      <JsonLd data={{ "@context": "https://schema.org", "@type": "WebSite", name: SITE_NAME, url: SITE_URL, inLanguage: "es" }} />
      <SiteHeader username={username} current="home" />
      <main id="contenido" className="flex-1">
        <HomeHero username={username} />
        <SeatContrast />
        <DhondtExample />
        <HomeClosing />
      </main>
    </>
  );
}
