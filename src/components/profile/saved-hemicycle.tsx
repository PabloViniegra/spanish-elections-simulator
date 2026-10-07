import type { CSSProperties } from "react";
import type { Bloc } from "@/lib/elections/types";
import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_INNER_RADIUS,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  hemicycleSeats,
} from "@/lib/hemicycle-layout";

const seats = hemicycleSeats();
// Custom properties read by .chamber-fill in globals.css.
const vars = (values: Record<`--${string}`, number>): CSSProperties & Record<`--${string}`, number> => values;

// A saved scenario's chamber in miniature, with the majority line. Decorative:
// the summary next to it names every bloc with its seats. `order` staggers the
// fill in globals.css (.chamber-fill) so the list fills one chamber at a time.
export function SavedHemicycle({ ranked, order }: { ranked: readonly (Bloc & { seats: number })[]; order: number }) {
  const owners = ranked.flatMap((bloc) => Array<string>(bloc.seats).fill(bloc.colour));
  return (
    <svg viewBox={`0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`} aria-hidden="true" className="w-full" style={vars({ "--row": Math.min(order, 5) })}>
      {seats.map(({ x, y }, index) => (
        <circle
          key={index}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={2.9}
          className="chamber-fill"
          style={vars({ "--i": index })}
          fill={owners[index] ?? "var(--color-hairline)"}
        />
      ))}
      <line
        x1={HEMICYCLE_CENTER.x}
        y1={HEMICYCLE_CENTER.y - HEMICYCLE_OUTER_RADIUS - 5}
        x2={HEMICYCLE_CENTER.x}
        y2={HEMICYCLE_CENTER.y - HEMICYCLE_INNER_RADIUS + 5}
        stroke="var(--color-ink)"
        strokeWidth={1.6}
        strokeDasharray="2.5 2"
      />
    </svg>
  );
}
