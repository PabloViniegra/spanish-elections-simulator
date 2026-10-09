export const SITE_NAME = "Simulador de Elecciones";

export const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_PROJECT_PRODUCTION_URL ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}` : "http://localhost:3000");

// A page that sets `openGraph` replaces the layout's whole object, so it spreads this.
export const SITE_OPEN_GRAPH = { siteName: SITE_NAME, locale: "es_ES", type: "website" } as const;

export const OG_SIZE = { width: 1200, height: 630 };
