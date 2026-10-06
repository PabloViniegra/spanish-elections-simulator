import type { Bloc } from "@/lib/elections/types";
import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_INNER_RADIUS,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  hemicycleSeats,
  MAJORITY,
} from "@/lib/hemicycle-layout";

const seats = hemicycleSeats();

type ResultsHemicycleProps = {
  // Blocs with seats, largest first; they fill the chamber from the left.
  ranked: readonly (Bloc & { seats: number })[];
};

// FR-06: 350 seats coloured by bloc, with the 176 majority line. The list
// below names every bloc with its seats, so colour is never the only signal.
export function ResultsHemicycle({ ranked }: ResultsHemicycleProps) {
  const colours = ranked.flatMap((bloc) => Array<string>(bloc.seats).fill(bloc.colour));
  const summary = ranked.map((bloc) => `${bloc.name} ${bloc.seats}`).join(", ");
  return (
    <figure className="flex flex-col gap-4">
      <svg viewBox={`0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`} role="img" aria-label={`Hemiciclo de 350 escaños: ${summary}`} className="w-full">
        {seats.map(({ x, y }, index) => (
          <circle key={index} cx={x.toFixed(1)} cy={y.toFixed(1)} r={2.6} fill={colours[index] ?? "var(--color-hairline)"} />
        ))}
        <line
          x1={HEMICYCLE_CENTER.x}
          y1={HEMICYCLE_CENTER.y - HEMICYCLE_OUTER_RADIUS - 4}
          x2={HEMICYCLE_CENTER.x}
          y2={HEMICYCLE_CENTER.y - HEMICYCLE_INNER_RADIUS + 4}
          stroke="var(--color-ink)"
          strokeWidth={0.6}
          strokeDasharray="2 1.5"
        />
      </svg>
      <figcaption className="flex flex-col gap-3">
        <p className="text-center text-caption text-ink-muted-80">La línea marca la mayoría absoluta: {MAJORITY} escaños.</p>
        <ul className="flex flex-wrap justify-center gap-x-4 gap-y-1 text-caption">
          {ranked.map((bloc) => (
            <li key={bloc.id} className="flex items-center gap-1.5">
              <span aria-hidden="true" className="size-2.5 rounded-full" style={{ backgroundColor: bloc.colour }} />
              {bloc.name} <span className="font-semibold tabular-nums">{bloc.seats}</span>
            </li>
          ))}
        </ul>
      </figcaption>
    </figure>
  );
}
