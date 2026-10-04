import Link from "next/link";
import type { ReactNode } from "react";

type AuthCardProps = {
  title: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, children, footer }: AuthCardProps) {
  return (
    <main className="flex flex-1 flex-col items-center bg-canvas-parchment px-5 py-16 sm:py-section">
      <div className="flex w-full max-w-md flex-col gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <Link href="/" className="text-tagline text-ink">
            Simulador de Elecciones
          </Link>
          <h1 className="text-display-md">{title}</h1>
        </header>
        <div className="rounded-lg bg-canvas p-6 sm:p-8">{children}</div>
        <div className="text-center text-caption text-ink-muted-80">{footer}</div>
      </div>
    </main>
  );
}
