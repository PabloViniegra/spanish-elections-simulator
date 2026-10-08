import Link from "next/link";
import type { ReactNode } from "react";

const REPO_URL = "https://github.com/PabloViniegra/spanish-elections-simulator";

const sources = [
  { label: "Infoelectoral", role: "Resultados · Ministerio del Interior", href: "https://infoelectoral.interior.gob.es/" },
  { label: "BOE", role: "Normativa", href: "https://www.boe.es/" },
  { label: "INE", role: "Población", href: "https://www.ine.es/" },
  { label: "CNIG", role: "Cartografía", href: "https://www.cnig.es/" },
];

// The nav bar's hover rule, drawn under the text instead of on the bar's edge.
const linkClass =
  "inline-flex min-h-11 items-center gap-1.5 text-on-dark bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_1px] bg-[position:0_calc(50%+0.8em)] bg-no-repeat transition-[background-size] duration-300 ease-snappy hover:bg-[length:100%_1px] motion-reduce:duration-0";

const headingClass = "text-caption font-semibold text-on-dark-muted";

function ExternalArrow() {
  return (
    <svg viewBox="0 0 10 10" aria-hidden="true" className="size-2.5 shrink-0 fill-none stroke-current stroke-[1.4] opacity-60">
      <path d="M2.5 7.5 7.5 2.5M3.5 2.5h4v4" />
    </svg>
  );
}

// The header's two arcs, scaled up: the hemicycle split at the majority.
function Arcs({ className }: { className: string }) {
  return (
    <svg viewBox="0 0 200 100" aria-hidden="true" className={`fill-none stroke-[7] ${className}`}>
      <path d="M10 100A90 90 0 0 1 190 100" pathLength="100" className="stroke-on-dark/16 [stroke-dasharray:52_100]" />
      <path d="M10 100A90 90 0 0 1 190 100" pathLength="100" className="stroke-on-dark/8 [stroke-dasharray:0_55_45_100]" />
    </svg>
  );
}

// `children` is the note that belongs to the page (its legal basis or scope);
// the destinations and the official sources are the same everywhere.
export function SiteFooter({ children }: { children: ReactNode }) {
  return (
    <footer className="focus-on-dark relative isolate overflow-hidden bg-surface-black text-on-dark-muted">
      <Arcs className="pointer-events-none absolute bottom-0 left-1/2 -z-10 w-[min(64rem,140%)] -translate-x-1/2 translate-y-[76%]" />
      <div className="mx-auto grid max-w-content gap-12 px-5 pt-16 pb-28 sm:px-8 sm:pt-20 sm:pb-40 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16">
        <div className="flex flex-col gap-5">
          <Link href="/" className="flex w-fit items-center gap-3 text-tagline text-on-dark">
            <svg viewBox="3 9 26 16" aria-hidden="true" className="h-6 w-10 shrink-0 fill-none stroke-[6] stroke-on-dark">
              <path d="M6 22.5A10 10 0 0 1 26 22.5" pathLength="100" className="[stroke-dasharray:52_100]" />
              <path d="M6 22.5A10 10 0 0 1 26 22.5" pathLength="100" className="[stroke-dasharray:0_55_45_100]" />
            </svg>
            Simulador de Elecciones
          </Link>
          <p className="max-w-[44ch] text-caption text-pretty [&_a]:text-on-dark">{children}</p>
        </div>

        <div className="grid gap-10 xs:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]">
          <nav aria-labelledby="footer-explore" className="flex flex-col gap-2">
            <h2 id="footer-explore" className={headingClass}>
              Explorar
            </h2>
            <ul className="flex flex-col">
              <li>
                <Link href="/simulator" className={linkClass}>
                  Simulador
                </Link>
              </li>
              <li>
                <Link href="/how-it-works" className={linkClass}>
                  Cómo funciona
                </Link>
              </li>
              <li>
                <a href={REPO_URL} className={linkClass}>
                  Código en GitHub
                  <ExternalArrow />
                </a>
              </li>
            </ul>
          </nav>

          <div className="flex flex-col gap-2">
            <h2 className={headingClass}>Fuentes oficiales</h2>
            <ul className="grid grid-cols-2 gap-x-6">
              {sources.map(({ label, role, href }) => (
                <li key={label} className="flex flex-col pb-3">
                  <a href={href} className={linkClass}>
                    {label}
                    <ExternalArrow />
                  </a>
                  <span className="-mt-2 text-fine-print text-on-dark-muted/75">{role}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  );
}
