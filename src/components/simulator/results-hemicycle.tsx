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
  // The shares in the sliders do not fit in 100%, so this is the last split that did.
  stale?: boolean;
  // Blocs picked in the coalition calculator; the rest of the chamber steps back.
  selected?: ReadonlySet<string>;
};

// FR-06: 350 seats coloured by bloc, with the 176 majority line. The chips of
// the coalition calculator below double as the legend, and the label of the
// image names every bloc with its seats, so colour is never the only signal.
export function ResultsHemicycle({ ranked, stale = false, selected }: ResultsHemicycleProps) {
  const owners = ranked.flatMap((bloc) => Array<Bloc>(bloc.seats).fill(bloc));
  const picking = selected !== undefined && selected.size > 0;
  const summary = ranked.map((bloc) => `${bloc.name} ${bloc.seats}`).join(", ");
  return (
    <figure className="flex flex-col gap-4">
      <svg
        viewBox={`0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`}
        role="img"
        aria-label={`Hemiciclo de 350 escaños: ${summary}`}
        className={`w-full transition-opacity ${stale ? "opacity-40" : ""}`}
      >
        {seats.map(({ x, y }, index) => (
          <circle
            key={index}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={2.6}
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
      </figcaption>
    </figure>
  );
}
