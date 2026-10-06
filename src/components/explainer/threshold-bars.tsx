import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "../home/type";

// Invented shares of valid votes in one province; labelled as such on screen.
const rows = [
  { name: "Partido A", share: 38 },
  { name: "Partido B", share: 29 },
  { name: "Partido C", share: 21 },
  { name: "Partido D", share: 7.5 },
  { name: "Partido E", share: 2.4 },
  { name: "En blanco", share: 2.1, blank: true },
];
const THRESHOLD = 3;
// The longest bar fills the track; the threshold line sits at the same scale.
const SCALE = 40;
const width = (share: number) => `${(share / SCALE) * 100}%`;
const percent = (share: number) => `${share.toLocaleString("es-ES")} %`;

export function ThresholdBars() {
  return (
    <section aria-labelledby="threshold-title" className="depth-scope overflow-clip bg-canvas-parchment">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        <div className="rise-scope flex flex-col gap-5">
          <h2 id="threshold-title" className={`rise [--c:0] ${sectionTitle}`}>
            Por debajo del 3 %, fuera.
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            En cada provincia, los partidos que no llegan al 3 % de los votos válidos se quedan sin reparto. El voto en blanco no
            se lleva escaños, pero sí cuenta para calcular ese 3 %.
          </p>
          <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
            El listón se mide provincia a provincia. Lo que un partido saque en el resto de España no le ayuda a superarlo.
          </p>
        </div>
        <figure className="flex flex-col gap-4">
          <table className="w-full border-collapse text-left">
            <caption className="sr-only">Ejemplo con datos inventados: porcentaje de voto válido de cada candidatura en una provincia</caption>
            <thead className="sr-only">
              <tr>
                <th scope="col">Candidatura</th>
                <th scope="col">Voto válido</th>
                <th scope="col">Reparto</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(({ name, share, blank }, i) => {
                const out = !blank && share < THRESHOLD;
                return (
                  <tr key={name}>
                    <th scope="row" className={`w-0 py-2 pr-4 text-caption font-normal whitespace-nowrap ${out || blank ? "text-ink-muted-80" : ""}`}>
                      {name}
                    </th>
                    <td className="py-2">
                      <div className="relative h-7">
                        <div
                          aria-hidden="true"
                          style={{ ...cssVar("--i", i), width: width(share) }}
                          className={`bar-grow h-full rounded-xs ${blank ? "border border-dashed border-ink-muted-48" : out ? "bg-ink-muted-48" : "bg-ink"}`}
                        />
                        {/* Drawn per row so it runs through the bars, not behind them. */}
                        <span aria-hidden="true" style={{ left: width(THRESHOLD) }} className="absolute -inset-y-2 w-0.5 -translate-x-1/2 bg-primary" />
                      </div>
                    </td>
                    <td className="w-0 py-2 pl-3 text-right text-caption whitespace-nowrap tabular-nums">
                      {percent(share)}
                      <span className={`block text-fine-print ${out ? "font-semibold" : "text-ink-muted-80"}`}>
                        {blank ? "sin escaños" : out ? "fuera" : "entra"}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          <figcaption className="text-caption text-pretty text-ink-muted-80">
            Ejemplo con datos inventados. La línea azul marca el 3 %.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
