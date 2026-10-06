import { HEMICYCLE_CENTER, HEMICYCLE_HEIGHT, HEMICYCLE_INNER_RADIUS, HEMICYCLE_OUTER_RADIUS, HEMICYCLE_WIDTH, MAJORITY, TOTAL_SEATS, hemicycleSeats } from "@/lib/hemicycle-layout";
import { cssVar } from "@/lib/css-var";
import { pageTitle } from "../home/type";

// Seats light up from the innermost row outwards, each row from the centre to
// both sides, so the majority reads as a share of the chamber and not as one side.
const seats = hemicycleSeats()
  .map((seat) => ({ ...seat, radius: Math.round(Math.hypot(seat.x - HEMICYCLE_CENTER.x, seat.y - HEMICYCLE_CENTER.y)) }))
  .sort((a, b) => a.radius - b.radius || Math.abs(a.angle - Math.PI / 2) - Math.abs(b.angle - Math.PI / 2));
const PAD = 12;

// The title lifts away faster than the hemicycle, which sinks behind it.
export function ExplainerHero() {
  return (
    <section aria-labelledby="explainer-title" className="lift-scope overflow-clip bg-surface-black text-on-dark">
      <div className="mx-auto flex max-w-content flex-col items-center gap-12 px-5 pt-14 pb-16 text-center sm:px-8 lg:min-h-[calc(100svh-2.75rem)] lg:justify-between lg:pt-20">
        <div className="lift-away flex flex-col items-center gap-6">
          <h1 id="explainer-title" className={`hero-rise [--c:0] ${pageTitle}`}>
            Del voto
            <br />
            al escaño.
          </h1>
          <p className="hero-rise max-w-[34rem] text-body text-pretty text-on-dark-muted [--c:1] lg:text-lead-airy">
            El Congreso tiene {TOTAL_SEATS} diputados. Así se decide, paso a paso, quién ocupa cada asiento, sin necesidad de
            saber derecho electoral.
          </p>
        </div>
        <figure className="sink flex w-full max-w-[min(60rem,max(18rem,calc((100svh-30rem)*2)))] flex-col items-center gap-4">
          <svg
            viewBox={`${-PAD} ${-PAD} ${HEMICYCLE_WIDTH + 2 * PAD} ${HEMICYCLE_HEIGHT + PAD}`}
            aria-hidden="true"
            className="w-full"
          >
            {seats.map(({ x, y }, i) => (
              <circle
                key={`${x}-${y}`}
                cx={x.toFixed(1)}
                cy={y.toFixed(1)}
                r={2.7}
                style={cssVar("--i", i)}
                className={`seat-in ${i < MAJORITY ? "fill-on-dark" : "fill-on-dark/25"}`}
              />
            ))}
            <path
              d={`M${HEMICYCLE_CENTER.x} ${-PAD}V${HEMICYCLE_CENTER.y - HEMICYCLE_OUTER_RADIUS - 5}M${HEMICYCLE_CENTER.x} ${HEMICYCLE_CENTER.y - HEMICYCLE_INNER_RADIUS + 5}V${HEMICYCLE_HEIGHT}`}
              fill="none"
              strokeWidth={0.6}
              strokeDasharray="1.5 1.5"
              className="stroke-on-dark-muted"
            />
          </svg>
          <figcaption className="text-caption text-on-dark-muted">
            {TOTAL_SEATS} escaños · los <span className="font-semibold text-on-dark">{MAJORITY}</span> encendidos son la mayoría absoluta
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
