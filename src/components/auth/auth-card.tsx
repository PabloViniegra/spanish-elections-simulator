import Link from "next/link";
import type { ReactNode } from "react";
import { HemicycleMark } from "@/components/brand/hemicycle-mark";

type AuthCardProps = {
  title: string;
  description: string;
  children: ReactNode;
  footer: ReactNode;
};

export function AuthCard({ title, description, children, footer }: AuthCardProps) {
  return (
    <main className="flex flex-1 flex-col items-center bg-canvas-parchment px-5 py-8 sm:py-section">
      <div className="flex w-full max-w-md flex-col gap-6 sm:gap-8">
        <header className="flex flex-col items-center gap-3 text-center">
          <HemicycleMark className="w-24 sm:w-32" />
          <Link href="/" className="text-tagline text-ink underline underline-offset-4">
            Simulador de Elecciones
          </Link>
          <h1 className="text-display-md leading-tight">{title}</h1>
          <p className="text-body text-ink-muted-80">{description}</p>
        </header>
        <div className="rounded-lg bg-canvas p-6 sm:p-8">{children}</div>
        <div className="text-center text-caption text-ink-muted-80">{footer}</div>
      </div>
    </main>
  );
}
