import type { Bloc } from "@/lib/elections/types";
import { MAJORITY } from "@/lib/hemicycle-layout";

type CoalitionCalculatorProps = {
  ranked: readonly (Bloc & { seats: number })[];
  selected: ReadonlySet<string>;
  onToggle: (blocId: string) => void;
  coalitions: readonly { members: string[]; seats: number }[];
};

// FR-08: the user picks blocs and sees their sum against 176, plus every
// minimal combination that reaches it.
export function CoalitionCalculator({ ranked, selected, onToggle, coalitions }: CoalitionCalculatorProps) {
  const total = ranked.filter((bloc) => selected.has(bloc.id)).reduce((sum, bloc) => sum + bloc.seats, 0);
  const gap = MAJORITY - total;
  const nameOf = new Map(ranked.map((bloc) => [bloc.id, bloc.name]));
  return (
    <section aria-labelledby="coalition-title" className="flex flex-col gap-4">
      <h2 id="coalition-title" className="text-tagline">
        Calculadora de mayorías
      </h2>
      <fieldset>
        <legend className="mb-2 text-caption text-ink-muted-80">Elige los partidos que sumarían sus escaños.</legend>
        <div className="flex flex-wrap gap-2">
          {ranked.map((bloc) => (
            <label
              key={bloc.id}
              className="flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hairline px-3 text-caption has-checked:border-ink has-checked:bg-canvas-parchment has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-focus"
            >
              <input type="checkbox" checked={selected.has(bloc.id)} onChange={() => onToggle(bloc.id)} className="sr-only" />
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: bloc.colour }} />
              {bloc.name} <span className="tabular-nums text-ink-muted-80">{bloc.seats}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <p aria-live="polite" className="text-body">
        <span className="text-lead font-semibold tabular-nums">{total}</span> escaños.{" "}
        {total === 0
          ? `La mayoría absoluta son ${MAJORITY}.`
          : gap > 0
            ? `Faltan ${gap} para la mayoría absoluta.`
            : `Mayoría absoluta, con ${-gap} de margen.`}
      </p>
      <details className="text-caption">
        <summary className="cursor-pointer py-2">Combinaciones mínimas que llegan a {MAJORITY} ({coalitions.length})</summary>
        <p className="mb-2 text-ink-muted-80">Cada una pierde la mayoría si sale cualquiera de sus partidos.</p>
        <ul className="flex flex-col gap-1">
          {coalitions.map(({ members, seats }) => (
            <li key={members.join()} className="flex justify-between gap-4 border-b border-divider-soft py-1">
              <span>{members.map((id) => nameOf.get(id)).join(" + ")}</span>
              <span className="tabular-nums">{seats}</span>
            </li>
          ))}
        </ul>
      </details>
    </section>
  );
}
