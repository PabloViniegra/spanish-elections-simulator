import type { Metadata } from "next";
import { SiteHeader } from "@/components/home/site-header";
import { sectionTitle } from "@/components/home/type";
import { SiteFooter } from "@/components/layout/site-footer";
import { PrivacyData } from "@/components/legal/privacy-data";
import { PrivacyRights } from "@/components/legal/privacy-rights";
import { getSession } from "@/lib/auth/session";
import { PRIVACY_UPDATED } from "@/lib/legal";

export const metadata: Metadata = {
  title: "Privacidad",
  description: "Qué datos trata el Simulador de Elecciones, para qué, durante cuánto tiempo y cómo ejercer tus derechos.",
  alternates: { canonical: "/privacy" },
};

export default async function PrivacyPage() {
  const session = await getSession();
  return (
    <>
      <SiteHeader username={session?.user.name} current="privacy" />
      <main id="contenido" className="flex-1">
        <div className="focus-on-dark bg-surface-black text-on-dark">
          <div className="mx-auto flex max-w-content flex-col gap-3 px-5 pt-14 pb-12 sm:px-8 lg:pt-20 lg:pb-16">
            <h1 className={`hero-rise [--c:0] ${sectionTitle}`}>Privacidad</h1>
            <p className="hero-rise text-body text-on-dark-muted [--c:1]">Última actualización: {PRIVACY_UPDATED}</p>
          </div>
        </div>
        <div className="mx-auto flex max-w-[44rem] flex-col gap-10 px-5 py-12 sm:px-8 lg:py-16">
          <p className="text-lead-airy text-pretty">
            Tratamos los mínimos datos necesarios para que el simulador funcione. Sin publicidad, sin rastreo y sin banner de
            cookies, porque no hay cookies que aceptar.
          </p>
          <PrivacyData />
          <PrivacyRights />
        </div>
      </main>
      <SiteFooter>Simulador sin ánimo de lucro. Tus datos solo se usan para darte el servicio.</SiteFooter>
    </>
  );
}
