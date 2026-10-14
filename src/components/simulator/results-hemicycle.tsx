import type { CSSProperties } from "react";
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
// Seat order drives the colour sweep in globals.css (.seat).
const sweepStyle = (index: number): CSSProperties & Record<`--${string}`, number> => ({ "--i": index });

type ResultsHemicycleProps = {
  ranked: readonly (Bloc & { seats: number })[];
  stale?: boolean;
  selected?: ReadonlySet<string>;
  disclaimer: string;
};

// FR-06: the label names every bloc with its seats, so colour is never the only signal.
export function ResultsHemicycle({ ranked, stale = false, selected, disclaimer }: ResultsHemicycleProps) {
  const picking = selected !== undefined && selected.size > 0;
  const order = picking ? [...ranked.filter((bloc) => selected.has(bloc.id)), ...ranked.filter((bloc) => !selected.has(bloc.id))] : ranked;
  const owners = order.flatMap((bloc) => Array<Bloc>(bloc.seats).fill(bloc));
  const summary = ranked.map((bloc) => `${bloc.name} ${bloc.seats}`).join(", ");
  return (
    <figure className="flex flex-col gap-4">
      <svg
        viewBox={`0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`}
        role="img"
        aria-label={`Hemiciclo de 350 escaños: ${summary}`}
        className={`w-full transition-opacity duration-150 ${stale ? "opacity-65" : ""}`}
      >
        {seats.map(({ x, y }, index) => (
          <circle
            key={index}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={2.6}
            className="seat"
            style={sweepStyle(index)}
            fill={owners[index]?.colour ?? "var(--color-hairline)"}
            opacity={picking && owners[index] && !selected.has(owners[index].id) ? 0.2 : 1}
          />
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
      <figcaption className="text-center text-caption text-ink-muted-80">
        {stale && <strong className="font-semibold text-ink">Último reparto válido. </strong>}La línea marca la mayoría absoluta: {MAJORITY} escaños.
        <span className="block font-semibold text-ink">{disclaimer}</span>
      </figcaption>
    </figure>
  );
}
