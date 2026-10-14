import { cssVar } from "@/lib/css-var";
import type { Bloc } from "@/lib/elections/types";
import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_INNER_RADIUS,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  hemicycleSeats,
} from "@/lib/hemicycle-layout";

const SEAT_RADIUS = 2.9;
const seats = hemicycleSeats();
const viewBox = `0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`;
const emptySeats = seats
  .map(({ x, y }) => `M${(x - SEAT_RADIUS).toFixed(1)} ${y.toFixed(1)}a${SEAT_RADIUS} ${SEAT_RADIUS} 0 1 0 ${2 * SEAT_RADIUS} 0a${SEAT_RADIUS} ${SEAT_RADIUS} 0 1 0 ${-2 * SEAT_RADIUS} 0`)
  .join("");
// Decorative: the summary next to it names every bloc with its seats.
export function SavedHemicycle({ ranked, order }: { ranked: readonly (Bloc & { seats: number })[]; order: number }) {
  const owners = ranked.flatMap((bloc) => Array<string>(bloc.seats).fill(bloc.colour));
  return (
    <div aria-hidden="true" className="grid">
      <svg viewBox={viewBox} className="col-start-1 row-start-1 w-full">
        <path d={emptySeats} fill="var(--color-hairline)" />
      </svg>
      <svg viewBox={viewBox} className="chamber-fill col-start-1 row-start-1 w-full" style={cssVar("--row", Math.min(order, 5))}>
        {owners.map((colour, index) => (
          <circle key={index} cx={seats[index].x.toFixed(1)} cy={seats[index].y.toFixed(1)} r={SEAT_RADIUS} fill={colour} />
        ))}
      </svg>
      <svg viewBox={viewBox} className="col-start-1 row-start-1 w-full">
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
    </div>
  );
}
