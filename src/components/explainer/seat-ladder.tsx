import { cssVar } from "@/lib/css-var";
import { provinces } from "@/lib/provinces";
import { simulationSeats } from "@/lib/elections/current";
import { sectionTitle } from "../home/type";
import { ElectionReference } from "../legal/election-reference";

// From the most deputies to the fewest, one dot per seat.
const ladder = ["28", "08", "46", "41", "29", "50", "06", "44", "42", "51"].map((code) => ({
  code,
  name: provinces.find((province) => province.code === code)?.name ?? code,
  seats: simulationSeats.get(code) ?? 0,
}));

export function SeatLadder() {
  return (
    <section aria-labelledby="ladder-title" className="depth-scope overflow-clip bg-canvas">
      <div className="mx-auto flex max-w-content flex-col gap-14 px-5 py-section sm:px-8 lg:gap-20 lg:py-40">
        {/* Full width on purpose: the gap between Madrid's row and Ceuta's single dot is the point. */}
        <div className="rise-scope grid gap-5 lg:grid-cols-[5fr_7fr] lg:items-end lg:gap-16">
          <h2 id="ladder-title" className={`rise [--c:0] ${sectionTitle}`}>
            Cada provincia elige su número.
          </h2>
          <div className="flex flex-col gap-5">
            <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
              Todas parten de 2 diputados, y Ceuta y Melilla tienen 1. Los 248 que quedan se reparten según la población. Por eso
              Madrid elige {simulationSeats.get("28")} y Soria, {simulationSeats.get("42")}.
            </p>
            <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
              El reparto lo fija el decreto que convoca cada elección. <ElectionReference />
            </p>
          </div>
        </div>
        <table className="w-full border-collapse text-left">
          <caption className="caption-bottom pt-4 text-left text-caption text-ink-muted-80">
            Diez de las 52 circunscripciones, de la que más diputados elige a la que menos.
          </caption>
          <thead className="sr-only">
            <tr>
              <th scope="col">Provincia</th>
              <th scope="col">Diputados</th>
            </tr>
          </thead>
          <tbody>
            {ladder.map(({ code, name, seats }) => (
              <tr key={code} className="border-b border-divider-soft">
                <th scope="row" className="w-0 py-2.5 pr-4 align-middle text-caption font-normal whitespace-nowrap sm:pr-6 sm:text-body lg:py-3.5 lg:pr-10">
                  {name.split("/")[0]}
                </th>
                <td className="py-2.5 align-middle lg:py-3.5">
                  <span className="sr-only">{seats}</span>
                  <span aria-hidden="true" className="flex items-center gap-3">
                    {/* One line per province at every width, so row length stays the comparison; dots scale with the viewport so Madrid always fits. */}
                    <span className="reveal-scope flex gap-[0.4vw]">
                      {Array.from({ length: seats }, (_, i) => (
                        <span key={i} style={cssVar("--i", i * 2)} className="reveal-dot size-[clamp(4px,1vw,16px)] shrink-0 rounded-full bg-ink" />
                      ))}
                    </span>
                    <span className="text-caption font-semibold tabular-nums lg:text-tagline">{seats}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}
