import map from "@/data/map/provinces.json";
import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "../home/type";

// North to south, so the provinces arrive like a sweep down the peninsula.
const order = new Map([...map.provinces].sort((a, b) => a.y - b.y).map(({ code }, i) => [code, i]));
const CITY_CODES = new Set(["51", "52"]);

export function ConstituencyMap() {
  return (
    <section aria-labelledby="map-title" className="depth-scope overflow-clip bg-canvas-parchment">
      <div className="relative mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        {/* A numeral far behind the map, drifting the other way. */}
        <p
          aria-hidden="true"
          style={cssVar("--d", -6)}
          className="depth pointer-events-none absolute -top-4 right-2 text-[clamp(10rem,32vw,26rem)] leading-none font-semibold tracking-[-0.05em] text-hairline select-none sm:right-8"
        >
          52
        </p>
        <div style={cssVar("--d", 2)} className="depth rise-scope relative flex flex-col gap-5">
          <h2 id="map-title" className={`rise [--c:0] ${sectionTitle}`}>
            No hay un recuento.
            <br />
            Hay 52.
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            Cada provincia es una circunscripción, y también lo son Ceuta y Melilla. Tu voto solo cuenta en la tuya: allí se suman
            los votos y allí se reparten sus escaños, sin mirar lo que pasa en el resto de España.
          </p>
        </div>
        <figure style={cssVar("--d", -3)} className="depth relative flex flex-col gap-3">
          <svg viewBox={`0 0 ${map.width} ${map.height}`} aria-hidden="true" className="reveal-scope w-full drop-shadow-[3px_5px_30px_rgb(0_0_0/0.22)]">
            <path d={map.inset} fill="none" className="stroke-ink-muted-48" strokeWidth={1} />
            {map.provinces.map(({ code, d, x, y }) =>
              CITY_CODES.has(code) ? (
                <circle key={code} cx={x} cy={y} r={5} style={cssVar("--i", order.get(code) ?? 0)} className="reveal-dot origin-center fill-ink [transform-box:fill-box]" />
              ) : (
                <path
                  key={code}
                  d={d}
                  strokeWidth={0.8}
                  style={cssVar("--i", order.get(code) ?? 0)}
                  className="reveal-dot origin-center fill-ink stroke-canvas-parchment [transform-box:fill-box]"
                />
              ),
            )}
          </svg>
          <figcaption className="text-caption text-ink-muted-80">Las 52 circunscripciones del Congreso. Canarias, en el recuadro.</figcaption>
        </figure>
      </div>
    </section>
  );
}
