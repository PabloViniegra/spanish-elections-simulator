import { cssVar } from "@/lib/css-var";
import { DESIGNATED_SENATORS, designated } from "@/lib/senate/senate";
import { sectionTitle } from "../../home/type";
import { DesignatedCalculator } from "./designated-calculator";

const HALF = Math.ceil(designated.length / 2);

function DesignatedTable({ rows, offset }: { rows: typeof designated; offset: number }) {
  return (
    <table
      aria-label={`Senadores designados por comunidad, ${offset + 1} a ${offset + rows.length} de ${designated.length}`}
      className="w-full table-fixed border-collapse text-left"
    >
      <colgroup>
        <col className="w-40 sm:w-52" />
        <col />
      </colgroup>
      <thead className="sr-only">
        <tr>
          <th scope="col">Comunidad</th>
          <th scope="col">Senadores designados</th>
        </tr>
      </thead>
      <tbody className="reveal-scope">
        {rows.map(({ name, seats }, i) => {
          const row = offset + i;
          return (
            <tr key={name} className="border-b border-divider-soft">
              <th scope="row" className="py-2.5 pr-4 align-middle text-caption font-normal sm:text-body">
                {name}
              </th>
              <td className="py-2.5 align-middle">
                <span className="sr-only">{seats}</span>
                <span aria-hidden="true" className="flex items-center gap-3">
                  <span className="flex gap-1.5">
                    {Array.from({ length: seats }, (_, dot) => (
                      <span key={dot} style={cssVar("--i", row + dot * 2)} className="reveal-dot size-3 shrink-0 rounded-full bg-ink sm:size-4" />
                    ))}
                  </span>
                  <span className="text-caption font-semibold tabular-nums">{seats}</span>
                </span>
              </td>
            </tr>
          );
        })}
      </tbody>
    </table>
  );
}

export function SenateDesignated() {
  return (
    <section aria-labelledby="senate-designated-title" className="overflow-clip bg-canvas">
      <div className="mx-auto flex max-w-content flex-col gap-14 px-5 py-section sm:px-8 lg:gap-20 lg:py-40">
        <div className="grid gap-12 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16">
          <div className="rise-scope rise-unmask flex flex-col gap-5">
            <h2 id="senate-designated-title" className={`rise [--c:0] ${sectionTitle}`}>
              Los otros {DESIGNATED_SENATORS} los eligen las comunidades
            </h2>
            <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
              Cada parlamento autonómico nombra 1 senador, y otro más por cada millón de habitantes. Los reparte entre los partidos
              según el peso que tienen en esa cámara.
            </p>
            <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
              Cuántos le tocan a cada comunidad se fija con su población en las últimas elecciones generales. Cada parlamento
              elige a las personas según sus propias normas, casi siempre tras sus elecciones autonómicas, y puede cambiarlas sin
              que cambie el número.
            </p>
          </div>
          <DesignatedCalculator />
        </div>
        <figure className="flex flex-col gap-4">
          <div className="grid items-start gap-x-16 lg:grid-cols-2">
            <DesignatedTable rows={designated.slice(0, HALF)} offset={0} />
            <DesignatedTable rows={designated.slice(HALF)} offset={HALF} />
          </div>
          <figcaption className="max-w-[34rem] text-caption text-pretty text-ink-muted-80">
            Senadores designados por cada comunidad en la legislatura actual, la XV (Constitución, artículo 69.5). Ceuta y Melilla no
            tienen parlamento autonómico y no designan senadores.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
