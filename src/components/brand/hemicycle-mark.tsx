import { HEMICYCLE_HEIGHT, HEMICYCLE_WIDTH, hemicycleSeats } from "@/lib/hemicycle-layout";

const seats = hemicycleSeats();

// Decorative: 350 neutral seats, the first 176 (the absolute majority) a
// shade darker. No party colours, so no party is favoured.
export function HemicycleMark({ className }: { className?: string }) {
  return (
    <svg
      viewBox={`0 0 ${HEMICYCLE_WIDTH} ${HEMICYCLE_HEIGHT}`}
      aria-hidden="true"
      className={className}
    >
      {seats.map(({ x, y, majority }) => (
        <circle
          key={`${x}-${y}`}
          cx={x.toFixed(1)}
          cy={y.toFixed(1)}
          r={2.4}
          className={majority ? "fill-ink-muted-48" : "fill-hairline"}
        />
      ))}
    </svg>
  );
}
