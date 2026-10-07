import Link from "next/link";
import type { Bloc } from "@/lib/elections/types";
import { TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { DeleteSimulation } from "./delete-simulation";

export type SavedSimulation = {
  id: string;
  name: string;
  href: string;
  savedOn: string;
  // Null when the scenario no longer restores.
  summary: { baseLabel: string; ranked: readonly (Bloc & { seats: number })[] } | null;
};

function SeatBar({ ranked }: { ranked: readonly (Bloc & { seats: number })[] }) {
  return (
    <div aria-hidden="true" className="flex h-2 overflow-hidden rounded-full bg-hairline">
      {ranked.map((bloc) => (
        <span key={bloc.id} className="h-full" style={{ width: `${(bloc.seats / TOTAL_SEATS) * 100}%`, backgroundColor: bloc.colour }} />
      ))}
    </div>
  );
}

export function SimulationList({ simulations }: { simulations: readonly SavedSimulation[] }) {
  return (
    <section aria-labelledby="simulacros" className="flex flex-col gap-4">
      <h2 id="simulacros" className="text-tagline">
        Tus simulacros
      </h2>
      {simulations.length === 0 ? (
        <p className="text-body text-ink-muted-80">
          Todavía no has guardado ninguno.{" "}
          <Link href="/simulador" className="text-primary underline">
            Abre el simulador
          </Link>{" "}
          y usa «Guardar en mi perfil».
        </p>
      ) : (
        <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
          {simulations.map(({ id, name, href, savedOn, summary }) => (
            <li key={id} className="flex flex-col gap-2 py-4">
              <div className="flex flex-wrap items-baseline justify-between gap-x-4">
                <h3 className="min-w-0 text-body font-semibold break-words">{name}</h3>
                <p className="text-caption text-ink-muted-80">Guardado el {savedOn}</p>
              </div>
              {summary ? (
                <>
                  <SeatBar ranked={summary.ranked} />
                  <p className="text-caption text-ink-muted-80 tabular-nums">
                    Desde {summary.baseLabel}:{" "}
                    {summary.ranked
                      .slice(0, 4)
                      .map((bloc) => `${bloc.name} ${bloc.seats}`)
                      .join(" · ")}
                  </p>
                </>
              ) : (
                <p className="text-caption text-error">Este simulacro es de una versión anterior y no se puede abrir.</p>
              )}
              <div className="flex items-center gap-6">
                {summary && (
                  <Link href={href} className="flex min-h-11 items-center text-caption font-semibold text-primary underline underline-offset-2">
                    Abrir<span className="sr-only"> «{name}»</span>
                  </Link>
                )}
                <DeleteSimulation id={id} name={name} />
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
