import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "Simulador de Elecciones", template: "%s · Simulador de Elecciones" },
  description:
    "Convierte una estimación de voto en el reparto de escaños del Congreso de los Diputados.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="es" className="h-full antialiased">
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
