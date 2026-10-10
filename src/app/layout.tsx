import type { Metadata } from "next";
import { connection } from "next/server";
import { SiteAnalytics } from "@/components/analytics/site-analytics";
import { Toaster } from "@/components/feedback/toaster";
import { SITE_NAME, SITE_OPEN_GRAPH, SITE_URL } from "@/lib/site";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: SITE_NAME, template: `%s · ${SITE_NAME}` },
  description: "Convierte una estimación de voto en el reparto de escaños del Congreso de los Diputados.",
  openGraph: SITE_OPEN_GRAPH,
  twitter: { card: "summary_large_image" },
};

export default async function RootLayout({ children }: LayoutProps<"/">) {
  // Nonces are request-specific, so HTML must never be prerendered.
  await connection();
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster />
        <SiteAnalytics />
      </body>
    </html>
  );
}
