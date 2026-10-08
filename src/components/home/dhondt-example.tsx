import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "./type";

// Invented figures for a five-seat constituency; labelled as such on screen.
const blocs = [
  { name: "Partido A", votes: 40000 },
  { name: "Partido B", votes: 30000 },
  { name: "Partido C", votes: 20000 },
];
const divisors = [1, 2, 3, 4];
const seatCount = 5;

// Highest quotients win; ties go to the bloc with more votes, as the LOREG sets.
const quotients = blocs
  .flatMap((bloc) => divisors.map((d) => ({ bloc, d, q: bloc.votes / d })))
  .sort((a, b) => b.q - a.q || b.bloc.votes - a.bloc.votes);
const ranked = quotients.slice(0, seatCount);
// The highest quotient left without a seat shows why the last seat went where it did.
const firstOut = quotients[seatCount];

function seatOrder(bloc: string, d: number) {
  const index = ranked.findIndex((r) => r.bloc.name === bloc && r.d === d);
  return index === -1 ? undefined : index + 1;
}

// es-ES leaves four-digit numbers ungrouped by default; force it so 7.500
// lines up with 10.000 in the same column.
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

// Divisors that award no seat are context, not result: hidden on narrow
// screens so the table fits without horizontal scrolling, except the one
// holding the first quotient left out. The seat totals hide there too, as
// the dark boxes already count them.
const columnClass = (d: number) =>
  d === firstOut.d || blocs.some((bloc) => seatOrder(bloc.name, d)) ? "" : "hidden sm:table-cell";

export function DhondtExample() {
  return (
    <section aria-labelledby="dhondt-title" className="bg-canvas">
      <div className="mx-auto grid max-w-content gap-10 px-5 py-section sm:px-8 xl:grid-cols-[5fr_6fr] xl:items-start xl:gap-16 xl:py-32">
        <div className="rise-scope flex max-w-[44rem] flex-col gap-4">
          <h2 id="dhondt-title" className={`rise [--c:0] ${sectionTitle}`}>
            Cada escaño tiene su cociente.
          </h2>
          <p className="rise text-body text-pretty text-ink-muted-80 [--c:1]">
            En cada provincia, los votos de cada partido que supera el 3 % se dividen entre 1, 2,
            3… Cada resultado es un cociente, y los escaños van a los más altos.
          </p>
        </div>
        <div className="flex flex-col gap-4">
          <p id="dhondt-caption" className="max-w-prose text-caption text-pretty text-ink-muted-80">
            Ejemplo con datos inventados: una provincia que reparte {seatCount} escaños. Los
            recuadros oscuros son los escaños, numerados por orden de asignación.
          </p>
          <div
            role="region"
            aria-label="Tabla del ejemplo"
            tabIndex={0}
            className="max-w-[52rem] overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-focus"
          >
            <table aria-labelledby="dhondt-title" aria-describedby="dhondt-caption" className="w-full border-collapse text-left tabular-nums sm:min-w-[30rem]">
              <thead>
                <tr className="border-b border-hairline text-caption text-ink-muted-80">
                  <th scope="col" className="py-3 pr-1 font-normal sm:pr-4">Partido</th>
                  {divisors.map((d) => (
                    <th key={d} scope="col" className={`px-2 py-3 text-right font-normal ${columnClass(d)}`}>÷ {d}</th>
                  ))}
                  <th scope="col" className="hidden py-3 pl-4 text-right font-normal sm:table-cell">Escaños</th>
                </tr>
              </thead>
              <tbody className="reveal-scope">
                {blocs.map((bloc) => (
                  <tr key={bloc.name} className="border-b border-hairline">
                    <th scope="row" className="py-4 pr-1 text-body font-semibold sm:pr-4">{bloc.name}</th>
                    {divisors.map((d) => {
                      const order = seatOrder(bloc.name, d);
                      const q = Math.round(bloc.votes / d);
                      const out = bloc === firstOut.bloc && d === firstOut.d;
                      return (
                        <td key={d} className={`px-0.5 py-3 text-right text-caption sm:px-1 sm:text-body lg:text-tagline lg:font-normal ${columnClass(d)}`}>
                          {order ? (
                            <span
                              style={cssVar("--o", order)}
                              className="reveal-seat inline-flex items-baseline gap-px rounded-sm bg-ink px-1 py-1 text-on-dark sm:gap-1 sm:px-2">
                              {format(q)}
                              <sup className="text-fine-print">{order}.º</sup>
                              <span className="sr-only"> (escaño {order})</span>
                            </span>
                          ) : (
                            <span className={`px-1 sm:px-2 ${out ? "rounded-sm py-1 outline-1 -outline-offset-1 outline-ink-muted-48" : "text-ink-muted-80"}`}>
                              {format(q)}
                              {out && <span className="sr-only"> (primer cociente sin escaño)</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="hidden py-3 pl-4 text-right text-[clamp(1.5rem,3vw,2.5rem)] font-semibold sm:table-cell">
                      {ranked.filter((r) => r.bloc === bloc).length}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="max-w-prose text-caption text-pretty text-ink-muted-80">
            Los dos 20.000 empatan: el 3.º va al Partido A, que tiene más votos en total. El
            recuadro claro es el primer cociente que se queda sin escaño.
          </p>
        </div>
      </div>
    </section>
  );
}
