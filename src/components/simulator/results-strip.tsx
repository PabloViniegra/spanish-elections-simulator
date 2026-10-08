import type { Bloc } from "@/lib/elections/types";
import { MAJORITY, TOTAL_SEATS } from "@/lib/hemicycle-layout";

// Anchor of the results column the strip jumps to.
export const RESULTS_ID = "resultados";

type ResultsStripProps = {
  // Blocs with seats, largest first.
  ranked: readonly (Bloc & { seats: number })[];
  stale?: boolean;
  // Blocs picked in the coalition calculator.
  selected: ReadonlySet<string>;
};

// How far a seat count stands from the 176 line.
export function versusMajority(seats: number) {
  return seats >= MAJORITY ? `mayoría (${MAJORITY})` : `faltan ${MAJORITY - seats} para ${MAJORITY}`;
}

// The picked coalition, or the largest bloc, against the 176 line.
export function summaryOf(ranked: ResultsStripProps["ranked"], selected: ReadonlySet<string>) {
  const picked = ranked.filter((bloc) => selected.has(bloc.id));
  const coalition = picked.reduce((sum, bloc) => sum + bloc.seats, 0);
  const leader = ranked[0];
  const summary =
    picked.length > 0 ? `Coalición ${coalition} · ${versusMajority(coalition)}` : leader && `${leader.name} ${leader.seats} · ${versusMajority(leader.seats)}`;
  return { picked, summary };
}

// Narrow screens only: the hemicycle scrolls out of view while the sliders are
// used, so this strip keeps the seat split and the 176 line in sight: the
// largest bloc, or the picked coalition, against the majority. It links down to
// the hemicycle, which carries the accessible description.
// Its height is fixed (h-15) because the share budget pins itself right below
// it with the same value (top-15); change both together.
export function ResultsStrip({ ranked, stale = false, selected }: ResultsStripProps) {
  const { picked, summary } = summaryOf(ranked, selected);
  return (
    <a href={`#${RESULTS_ID}`} className="sticky top-0 z-10 block h-15 border-b border-hairline bg-canvas lg:hidden">
      <span className="sr-only">Ver el reparto de escaños</span>
      <div aria-hidden="true" className={`mx-auto flex h-full max-w-content flex-col justify-center gap-1.5 px-5 transition-opacity duration-150 sm:px-8 ${stale ? "opacity-65" : ""}`}>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-hairline">
          {ranked.map((bloc) => (
            <span
              key={bloc.id}
              className="h-full transition-[width,opacity] duration-150 motion-reduce:transition-none"
              style={{ width: `${(bloc.seats / TOTAL_SEATS) * 100}%`, backgroundColor: bloc.colour, opacity: picked.length > 0 && !selected.has(bloc.id) ? 0.2 : 1 }}
            />
          ))}
          <span className="absolute inset-y-0 w-px bg-ink" style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }} />
        </div>
        <p className="flex justify-between gap-3 text-caption tabular-nums">
          <span className="min-w-0 truncate font-semibold">{summary}</span>
          <span className="shrink-0 text-ink-muted-80">
            {stale ? "Sin actualizar" : <><span className="max-[359px]:hidden">Ver escaños </span>↓</>}
          </span>
        </p>
      </div>
    </a>
  );
}
