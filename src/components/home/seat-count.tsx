import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  MAJORITY,
  TOTAL_SEATS,
} from "@/lib/hemicycle-layout";
import { seatCount } from "@/lib/seat-count";

const { seats, steps, totalMs } = seatCount();
const PAD = 12;

// Point on the circle around the hemicycle centre, in SVG units.
function polar(radius: number, angle: number) {
  return {
    x: (HEMICYCLE_CENTER.x + radius * Math.cos(angle)).toFixed(1),
    y: (HEMICYCLE_CENTER.y - radius * Math.sin(angle)).toFixed(1),
  };
}

const slot = (startMs: number, durationMs: number) => ({
  animationDelay: `${startMs}ms`,
  animationDuration: `${durationMs}ms`,
});

// The finished count is the markup's default state; the CSS in globals.css
// replays the count over it only when motion is allowed. Each counted
// constituency leaves a faint mark on the rim, so the settled arc keeps its 52.
export function SeatCount() {
  return (
    <figure className="flex w-full flex-col items-center gap-5">
      <svg
        viewBox={`${-PAD} ${-PAD} ${HEMICYCLE_WIDTH + 2 * PAD} ${HEMICYCLE_HEIGHT + PAD}`}
        role="img"
        aria-label={`Hemiciclo del Congreso: ${TOTAL_SEATS} escaños repartidos en ${steps.length} circunscripciones. La mayoría absoluta está en ${MAJORITY}.`}
        className="w-full max-w-[min(64rem,calc((100svh-35rem)*2))] min-w-0"
      >
        {seats.map(({ x, y, delayMs }) => (
          <circle
            key={`${x}-${y}`}
            cx={x.toFixed(1)}
            cy={y.toFixed(1)}
            r={2.7}
            style={{ animationDelay: `${delayMs}ms` }}
            className="count-seat fill-on-dark"
          />
        ))}
        {steps.map(({ code, angle, startMs, durationMs }) => {
          const from = polar(HEMICYCLE_OUTER_RADIUS + 4, angle);
          const to = polar(HEMICYCLE_OUTER_RADIUS + 11, angle);
          const tick = { x1: from.x, y1: from.y, x2: to.x, y2: to.y };
          return (
            <g key={code}>
              <line
                {...tick}
                strokeWidth={0.6}
                style={{ animationDelay: `${startMs + durationMs}ms` }}
                className="count-mark stroke-on-dark/35"
              />
              <line
                {...tick}
                strokeWidth={0.8}
                style={slot(startMs, durationMs)}
                className="count-step stroke-primary-on-dark"
              />
            </g>
          );
        })}
        <line
          x1={HEMICYCLE_CENTER.x}
          x2={HEMICYCLE_CENTER.x}
          y1={-PAD}
          y2={HEMICYCLE_HEIGHT}
          strokeWidth={0.6}
          strokeDasharray="1.5 1.5"
          style={{ animationDuration: `${totalMs}ms` }}
          className="count-final stroke-primary-on-dark"
        />
      </svg>
      <figcaption className="grid text-center text-caption text-on-dark-muted tabular-nums">
        {steps.map(({ code, name, seats: n, order, seatsSoFar, startMs, durationMs }) => (
          <span key={code} aria-hidden="true" style={slot(startMs, durationMs)} className="count-step col-start-1 row-start-1">
            <span className="font-semibold text-on-dark">{name}</span> · {n} {n === 1 ? "escaño" : "escaños"} · {order}/
            {steps.length} · {seatsSoFar} de {TOTAL_SEATS}
          </span>
        ))}
        <span style={{ animationDuration: `${totalMs}ms` }} className="count-final col-start-1 row-start-1">
          {steps.length} circunscripciones · {TOTAL_SEATS} escaños
          <span className="hidden sm:inline"> · </span>
          <span className="block font-semibold text-primary-on-dark sm:inline">mayoría absoluta en {MAJORITY}</span>
        </span>
      </figcaption>
    </figure>
  );
}
