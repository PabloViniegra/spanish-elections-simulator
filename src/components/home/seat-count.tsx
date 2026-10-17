import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_INNER_RADIUS,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  MAJORITY,
  TOTAL_SEATS,
} from "@/lib/hemicycle-layout";
import { cssVar } from "@/lib/css-var";
import { seatCount } from "@/lib/seat-count";
import map from "@/data/map/provinces.json";
import { mapFrame, seatMapPositions } from "@/lib/seat-map";

const { seats, steps, totalMs } = seatCount();
const PAD = 12;
const origins = seatMapPositions(steps, PAD);
const FLIGHT_MS = 1100;
const endMs = totalMs + FLIGHT_MS;
const frame = mapFrame(PAD);

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

// The group carries the horizontal leg and the circle the vertical one, so their easings draw an arc.
export function SeatCount() {
  return (
    <figure className="flex w-full flex-col items-center gap-5">
      <svg
        viewBox={`${-PAD} ${-PAD} ${HEMICYCLE_WIDTH + 2 * PAD} ${HEMICYCLE_HEIGHT + PAD}`}
        role="img"
        aria-label={`Hemiciclo del Congreso: ${TOTAL_SEATS} escaños repartidos en ${steps.length} circunscripciones. La mayoría absoluta está en ${MAJORITY}.`}
        className="w-full max-w-[min(64rem,max(18rem,calc((100svh-40rem)*2)))] min-w-0"
      >
        {/* Built by `pnpm map:build`. */}
        <image
          href="/map/seat-count.svg"
          x={frame.x.toFixed(1)}
          y={frame.y}
          width={(map.width * frame.scale).toFixed(1)}
          height={(map.height * frame.scale).toFixed(1)}
          style={{ animationDuration: `${endMs}ms` }}
          className="count-map"
        />
        {seats.map(({ x, y, delayMs }, index) => (
          <g
            key={`${x}-${y}`}
            style={{ ...slot(delayMs, FLIGHT_MS), ...cssVar("--fly-x", +(origins[index].x - x).toFixed(1)) }}
            className="count-fly"
          >
            <circle
              cx={x.toFixed(1)}
              cy={y.toFixed(1)}
              r={2.7}
              style={{ ...slot(delayMs, FLIGHT_MS), ...cssVar("--fly-y", +(origins[index].y - y).toFixed(1)) }}
              className="count-seat fill-on-dark"
            />
          </g>
        ))}
        {steps.map(({ code, angle, startMs, durationMs }) => {
          const from = polar(HEMICYCLE_OUTER_RADIUS + 4, angle);
          const to = polar(HEMICYCLE_OUTER_RADIUS + 11, angle);
          return (
            <line
              key={code}
              x1={from.x}
              y1={from.y}
              x2={to.x}
              y2={to.y}
              strokeWidth={0.8}
              style={slot(startMs, durationMs)}
              className="count-step stroke-action-blue"
            />
          );
        })}
        <path
          d={`M${HEMICYCLE_CENTER.x} ${-PAD}V${HEMICYCLE_CENTER.y - HEMICYCLE_OUTER_RADIUS - 5}M${HEMICYCLE_CENTER.x} ${HEMICYCLE_CENTER.y - HEMICYCLE_INNER_RADIUS + 5}V${HEMICYCLE_HEIGHT}`}
          fill="none"
          strokeWidth={0.6}
          strokeDasharray="1.5 1.5"
          style={{ animationDuration: `${endMs}ms` }}
          className="count-final stroke-action-blue"
        />
      </svg>
      <figcaption className="grid text-center text-caption text-on-dark-muted tabular-nums">
        {steps.map(({ code, name, seats: n, order, seatsSoFar, startMs, durationMs }) => (
          <span key={code} aria-hidden="true" style={slot(startMs, durationMs)} className="count-step col-start-1 row-start-1">
            <span className="font-semibold text-on-dark">{name}</span> · {n} {n === 1 ? "escaño" : "escaños"} · {order}/
            {steps.length} · {seatsSoFar} de {TOTAL_SEATS}
          </span>
        ))}
        <span style={{ animationDuration: `${endMs}ms` }} className="count-final col-start-1 row-start-1">
          {steps.length} circunscripciones · {TOTAL_SEATS} escaños
          <span className="hidden sm:inline"> · </span>
          <span className="block font-semibold text-action-blue sm:inline">mayoría absoluta en {MAJORITY}</span>
        </span>
      </figcaption>
    </figure>
  );
}
