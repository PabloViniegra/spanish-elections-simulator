import type { Bloc } from "@/lib/elections/types";
import { MAJORITY } from "@/lib/hemicycle-layout";
import { CoalitionBar } from "./coalition-bar";

type CoalitionCalculatorProps = {
  ranked: readonly (Bloc & { seats: number })[];
  selected: ReadonlySet<string>;
  onToggle: (blocId: string) => void;
  coalitions: readonly { members: string[]; seats: number }[];
};

// FR-08: the user picks blocs and sees their sum against 176, plus every
// minimal combination that reaches it.
export function CoalitionCalculator({ ranked, selected, onToggle, coalitions }: CoalitionCalculatorProps) {
  const pickedBlocs = ranked.filter((bloc) => selected.has(bloc.id));
  const total = pickedBlocs.reduce((sum, bloc) => sum + bloc.seats, 0);
  const gap = MAJORITY - total;
  const nameOf = new Map(ranked.map((bloc) => [bloc.id, bloc.name]));
  return (
    <section aria-labelledby="coalition-title" className="flex flex-col gap-4">
      <h2 id="coalition-title" className="text-tagline">
        Calculadora de mayorías
      </h2>
      <fieldset>
        <legend className="mb-2 text-caption text-ink-muted-80">Cada color es un partido. Elígelos para sumar sus escaños.</legend>
        <div className="flex flex-wrap gap-2">
          {ranked.map((bloc) => (
            <label
              key={bloc.id}
              className="group flex min-h-11 cursor-pointer items-center gap-2 rounded-full border border-hairline px-3 text-caption transition-[color,background-color,border-color,scale] duration-300 active:scale-[0.96] active:duration-150 has-checked:border-ink has-checked:bg-ink has-checked:text-canvas has-focus-visible:outline-2 has-focus-visible:outline-offset-2 has-focus-visible:outline-primary-focus"
            >
              <input type="checkbox" checked={selected.has(bloc.id)} onChange={() => onToggle(bloc.id)} className="sr-only" />
              <span aria-hidden="true" className="size-2.5 rounded-full group-has-checked:ring-1 group-has-checked:ring-canvas" style={{ backgroundColor: bloc.colour }} />
              {bloc.name} <span className="tabular-nums text-ink-muted-80 transition-colors duration-300 group-has-checked:text-canvas">{bloc.seats}</span>
            </label>
          ))}
        </div>
      </fieldset>
      <div className="flex flex-col gap-3 rounded-lg bg-canvas-parchment p-4">
        <p aria-live="polite" className="text-body">
          <span key={total} className="tick inline-block text-lead font-semibold tabular-nums">
            {total}
          </span> escaños.{" "}
          {total === 0
            ? `La mayoría absoluta son ${MAJORITY}.`
            : gap > 0
              ? `Faltan ${gap} para la mayoría absoluta.`
              : `Mayoría absoluta, con ${-gap} de margen.`}
        </p>
        <CoalitionBar picked={pickedBlocs} total={total} />
      </div>
      <details className="text-caption">
        <summary className="min-h-11 cursor-pointer py-3">Combinaciones mínimas que llegan a {MAJORITY} ({coalitions.length})</summary>
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
