import type { Bloc } from "@/lib/elections/types";
import { MAJORITY, TOTAL_SEATS } from "@/lib/hemicycle-layout";

type ResultsStripProps = {
  // Blocs with seats, largest first.
  ranked: readonly (Bloc & { seats: number })[];
  stale?: boolean;
};

const LEADERS = 3;

// Narrow screens only: the hemicycle scrolls out of view while the sliders are
// used, so this strip keeps the seat split and the 176 line in sight. The
// hemicycle already carries the accessible description, hence aria-hidden.
// Its height is fixed (h-15) because the share budget pins itself right below
// it with the same value (top-15); change both together.
export function ResultsStrip({ ranked, stale = false }: ResultsStripProps) {
  const leaders = ranked.slice(0, LEADERS).map((bloc) => `${bloc.name} ${bloc.seats}`);
  return (
    <div aria-hidden="true" className="sticky top-0 z-10 h-15 border-b border-hairline bg-canvas lg:hidden">
      <div className={`mx-auto flex h-full max-w-content flex-col justify-center gap-1.5 px-5 transition-opacity sm:px-8 ${stale ? "opacity-40" : ""}`}>
        <div className="relative flex h-3 overflow-hidden rounded-full bg-hairline">
          {ranked.map((bloc) => (
            <span key={bloc.id} className="h-full" style={{ width: `${(bloc.seats / TOTAL_SEATS) * 100}%`, backgroundColor: bloc.colour }} />
          ))}
          <span className="absolute inset-y-0 w-px bg-ink" style={{ left: `${(MAJORITY / TOTAL_SEATS) * 100}%` }} />
        </div>
        <p className="flex justify-between gap-3 text-caption tabular-nums">
          <span className="truncate">{leaders.join(" · ")}</span>
          <span className="shrink-0 text-ink-muted-80">{stale ? "Último reparto válido" : `Mayoría ${MAJORITY}`}</span>
        </p>
      </div>
    </div>
  );
}
