import Link from "next/link";
import type { Bloc } from "@/lib/elections/types";
import { MAJORITY, TOTAL_SEATS } from "@/lib/hemicycle-layout";
import { DeleteSimulation, LIST_HEADING_ID, LIST_STATUS_ID } from "./delete-simulation";

export type SavedSimulation = {
  id: string;
  name: string;
  href: string;
  savedOn: string;
  // Null when the scenario no longer restores.
  summary: { baseLabel: string; ranked: readonly (Bloc & { seats: number })[] } | null;
};

// Seats as a bar, with a tick at the absolute majority.
function SeatBar({ ranked }: { ranked: readonly (Bloc & { seats: number })[] }) {
  return (
    <div aria-hidden="true" className="relative py-1">
      <div className="flex h-2 overflow-hidden rounded-full bg-hairline">
        {ranked.map((bloc) => (
          <span key={bloc.id} className="h-full" style={{ width: `${(bloc.seats / TOTAL_SEATS) * 100}%`, backgroundColor: bloc.colour }} />
        ))}
      </div>
      <span className="absolute inset-y-0 w-0.5 -translate-x-1/2 bg-ink" style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }} />
    </div>
  );
}

function Summary({ baseLabel, ranked }: NonNullable<SavedSimulation["summary"]>) {
  const [first] = ranked;
  const shown = ranked.slice(0, 4).map((bloc) => `${bloc.name} ${bloc.seats}`);
  const more = ranked.length - shown.length;
  return (
    <>
      <SeatBar ranked={ranked} />
      <p className="text-caption text-ink-muted-80 tabular-nums">
        Desde {baseLabel}: {shown.join(" · ")}
        {more > 0 && ` y ${more} más`}.{" "}
        {first && first.seats >= MAJORITY ? `${first.name} tiene mayoría absoluta.` : `Nadie llega solo a ${MAJORITY}.`}
      </p>
    </>
  );
}

export function SimulationList({ simulations }: { simulations: readonly SavedSimulation[] }) {
  return (
    <section aria-labelledby={LIST_HEADING_ID} className="flex flex-col gap-4">
      <h2 id={LIST_HEADING_ID} tabIndex={-1} className="text-display-md outline-none">
        Tus simulaciones{simulations.length > 0 && <span className="text-ink-muted-80 tabular-nums"> · {simulations.length}</span>}
      </h2>
      <p id={LIST_STATUS_ID} role="status" className="sr-only" />
      {simulations.length === 0 ? (
        <p className="text-body text-ink-muted-80">
          Todavía no has guardado ninguna.{" "}
          <Link href="/simulator" className="text-primary underline">
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
                <p className="text-caption text-ink-muted-80">Guardada el {savedOn}</p>
              </div>
              {summary ? (
                <Summary {...summary} />
              ) : (
                <p className="text-caption text-ink-muted-80">
                  Se guardó con una versión anterior del simulador y ya no se puede abrir. Puedes eliminarla.
                </p>
              )}
              <div className="flex items-center gap-8">
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
