import Link from "next/link";
import type { ReactNode } from "react";

const REPO_URL = "https://github.com/PabloViniegra/spanish-elections-simulator";

const sources = [
  { label: "Infoelectoral", href: "https://infoelectoral.interior.gob.es/" },
  { label: "BOE", href: "https://www.boe.es/" },
  { label: "INE", href: "https://www.ine.es/" },
  { label: "CNIG", href: "https://www.cnig.es/" },
];

const linkClass = "inline-flex min-h-11 items-center underline-offset-2 hover:text-on-dark hover:underline";

// `children` is the note that belongs to the page (its legal basis or scope);
// the destinations and the official sources are the same everywhere.
export function SiteFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="focus-on-dark bg-surface-black text-on-dark-muted">
      <div className="mx-auto flex max-w-content flex-col gap-6 px-5 py-8 sm:px-8">
        <div className="grid gap-6 text-caption sm:grid-cols-3">
          <nav aria-label="Pie de página" className="flex flex-col">
            <Link href="/simulator" className={linkClass}>
              Simulador
            </Link>
            <Link href="/how-it-works" className={linkClass}>
              Cómo funciona
            </Link>
            <a href={REPO_URL} className={linkClass}>
              Código en GitHub
            </a>
          </nav>
          <div className="sm:col-span-2">
            <h2 className="text-fine-print font-semibold text-on-dark">Fuentes oficiales</h2>
            <ul className="flex flex-wrap gap-x-5">
              {sources.map(({ label, href }) => (
                <li key={label}>
                  <a href={href} className={linkClass}>
                    {label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="max-w-prose text-fine-print text-pretty">
              Resultados de Infoelectoral (Ministerio del Interior), normativa del BOE, población del INE y cartografía del CNIG.
            </p>
          </div>
        </div>
        <p className="max-w-prose border-t border-white/15 pt-4 text-fine-print text-pretty">{children}</p>
      </div>
    </footer>
  );
}
