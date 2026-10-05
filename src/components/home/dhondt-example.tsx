import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "./type";

// Invented figures for a five-seat constituency; labelled as such on screen.
const blocs = [
  { name: "Bloque A", votes: 40000 },
  { name: "Bloque B", votes: 30000 },
  { name: "Bloque C", votes: 20000 },
];
const divisors = [1, 2, 3, 4];
const seatCount = 5;

// Highest quotients win; ties go to the bloc with more votes, as the LOREG sets.
const ranked = blocs
  .flatMap((bloc) => divisors.map((d) => ({ bloc, d, q: Math.floor(bloc.votes / d) })))
  .sort((a, b) => b.q - a.q || b.bloc.votes - a.bloc.votes)
  .slice(0, seatCount);

function seatOrder(bloc: string, d: number) {
  const index = ranked.findIndex((r) => r.bloc.name === bloc && r.d === d);
  return index === -1 ? undefined : index + 1;
}

// es-ES leaves four-digit numbers ungrouped by default; force it so 7.500
// lines up with 10.000 in the same column.
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

// Divisors that award no seat are context, not result: hidden on narrow
// screens so the table fits without horizontal scrolling.
const columnClass = (d: number) =>
  blocs.some((bloc) => seatOrder(bloc.name, d)) ? "" : "hidden sm:table-cell";

export function DhondtExample() {
  return (
    <section aria-labelledby="dhondt-title" className="bg-canvas">
      <div className="mx-auto flex max-w-content flex-col gap-10 px-5 py-section sm:px-8">
        <div className="rise-scope flex max-w-[44rem] flex-col gap-4">
          <h2 id="dhondt-title" className={`rise [--c:0] ${sectionTitle}`}>
            Cada escaño tiene su cociente.
          </h2>
          <p className="rise text-body text-pretty text-ink-muted-80 [--c:1]">
            Los votos de cada partido se dividen entre 1, 2, 3… y los escaños van a los cocientes
            más altos.
          </p>
        </div>
        <p id="dhondt-caption" className="-mb-6 max-w-text text-caption text-ink-muted-80">
          Ejemplo con datos inventados: una circunscripción que reparte {seatCount} escaños. Los
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
                <th scope="col" className="py-3 pr-2 font-normal sm:pr-4">Candidatura</th>
                {divisors.map((d) => (
                  <th key={d} scope="col" className={`px-2 py-3 text-right font-normal ${columnClass(d)}`}>÷ {d}</th>
                ))}
                <th scope="col" className="py-3 pl-2 text-right font-normal sm:pl-4">Escaños</th>
              </tr>
            </thead>
            <tbody className="reveal-scope">
              {blocs.map((bloc) => (
                <tr key={bloc.name} className="border-b border-hairline">
                  <th scope="row" className="py-4 pr-2 text-body font-semibold sm:pr-4">{bloc.name}</th>
                  {divisors.map((d) => {
                    const order = seatOrder(bloc.name, d);
                    const q = Math.floor(bloc.votes / d);
                    return (
                      <td key={d} className={`px-1 py-3 text-right text-body lg:text-tagline lg:font-normal ${columnClass(d)}`}>
                        {order ? (
                          <span
                            style={cssVar("--o", order)}
                            className="reveal-seat inline-flex items-baseline gap-0.5 rounded-sm bg-ink px-1.5 py-1 sm:gap-1 sm:px-2 text-on-dark">
                            {format(q)}
                            <sup className="text-fine-print">{order}.º</sup>
                            <span className="sr-only"> (escaño {order})</span>
                          </span>
                        ) : (
                          <span className="px-1.5 text-ink-muted-80 sm:px-2">{format(q)}</span>
                        )}
                      </td>
                    );
                  })}
                  <td className="py-3 pl-2 text-right sm:pl-4 text-[clamp(1.75rem,3vw,2.5rem)] font-semibold">
                    {ranked.filter((r) => r.bloc === bloc).length}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
