import Link from "next/link";
import { HemicycleMark } from "@/components/brand/hemicycle-mark";
import type { Bloc } from "@/lib/elections/types";
import { MAJORITY } from "@/lib/hemicycle-layout";
import { DeleteSimulation, LIST_HEADING_ID } from "./delete-simulation";
import { SavedHemicycle } from "./saved-hemicycle";

export type SavedSimulation = {
  id: string;
  name: string;
  href: string;
  savedOn: string;
  // Null when the scenario no longer restores.
  summary: { baseLabel: string; ranked: readonly (Bloc & { seats: number })[] } | null;
};

function Summary({ baseLabel, ranked }: NonNullable<SavedSimulation["summary"]>) {
  const [first] = ranked;
  const shown = ranked.slice(0, 4).map((bloc) => `${bloc.name} ${bloc.seats}`);
  const more = ranked.length - shown.length;
  return (
    <p className="text-caption text-ink-muted-80 tabular-nums">
      Desde {baseLabel}: {shown.join(" · ")}
      {more > 0 && ` y ${more} más`}.{" "}
      <span className="font-semibold text-ink">
        {first && first.seats >= MAJORITY ? `${first.name} tiene mayoría absoluta.` : `Nadie llega solo a ${MAJORITY}.`}
      </span>
    </p>
  );
}

function EmptyList() {
  return (
    <div className="flex flex-col items-start gap-6 rounded-lg bg-canvas-parchment px-6 py-10 sm:px-10">
      <HemicycleMark className="w-full max-w-60" />
      <p className="max-w-[34rem] text-body text-ink-muted-80">
        Todavía no has guardado ninguna.{" "}
        <Link href="/simulator" className="font-semibold text-primary underline underline-offset-2">
          Abre el simulador
        </Link>{" "}
        y usa «Guardar en mi perfil».
      </p>
    </div>
  );
}

// A row steps back while its deletion is being confirmed, and further while it runs.
const row =
  "group grid grid-cols-[minmax(0,1fr)] gap-x-8 gap-y-4 py-6 transition-opacity duration-300 has-[[data-deleting]]:opacity-50 sm:grid-cols-[11rem_minmax(0,1fr)] sm:items-center";
const chamber =
  "block w-40 transition-[filter,opacity,scale] duration-300 group-has-[[data-confirming]]:opacity-50 group-has-[[data-confirming]]:grayscale sm:w-full";

export function SimulationList({ simulations }: { simulations: readonly SavedSimulation[] }) {
  return (
    <section aria-labelledby={LIST_HEADING_ID} className="flex flex-col gap-2">
      <h2 id={LIST_HEADING_ID} tabIndex={-1} className="text-display-md outline-none">
        Tus simulaciones{simulations.length > 0 && <span className="text-ink-muted-48 tabular-nums"> · {simulations.length}</span>}
      </h2>
      {simulations.length === 0 ? (
        <div className="pt-4">
          <EmptyList />
        </div>
      ) : (
        <>
          <p className="text-caption text-ink-muted-80">Es una simulación, no una previsión.</p>
          <ul className="mt-4 flex flex-col divide-y divide-hairline border-y border-hairline">
            {simulations.map(({ id, name, href, savedOn, summary }, index) => (
              <li key={id} className={row}>
                {summary ? (
                  // The chamber opens the scenario too; the link below is the named one.
                  <Link href={href} tabIndex={-1} aria-hidden="true" className={`${chamber} active:scale-[0.97]`}>
                    <SavedHemicycle ranked={summary.ranked} order={index} />
                  </Link>
                ) : (
                  <div className={`${chamber} opacity-50`}>
                    <HemicycleMark className="w-full" />
                  </div>
                )}
                <div className="flex min-w-0 flex-col gap-2">
                  <div className="flex flex-col gap-0.5">
                    <h3 className="text-tagline break-words">{name}</h3>
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
                </div>
              </li>
            ))}
          </ul>
        </>
      )}
    </section>
  );
}
