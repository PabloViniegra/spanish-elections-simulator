import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "./type";

// Invented figures for a five-seat constituency; labelled as such on screen.
const SEATS = 5;
const DIVISORS = [1, 2, 3];
const blocs = [
  { name: "Partido A", votes: 40000 },
  { name: "Partido B", votes: 30000 },
  { name: "Partido C", votes: 20000 },
];
// The threshold counts every valid vote, including the one it excludes.
const THRESHOLD = 0.03;
const excluded = { name: "Partido D", votes: 1400 };

const validVotes = [...blocs, excluded].reduce((total, bloc) => total + bloc.votes, 0);
const qualifying = blocs.filter((bloc) => bloc.votes >= validVotes * THRESHOLD);

// Highest quotients win; ties go to the bloc with more votes, as the LOREG sets.
const quotients = qualifying
  .flatMap((bloc) => DIVISORS.map((d) => ({ bloc, d, q: bloc.votes / d })))
  .sort((a, b) => b.q - a.q || b.bloc.votes - a.bloc.votes);
const ranked = quotients.slice(0, SEATS);
const firstOut = quotients[SEATS];

function seatOrder(bloc: string, d: number) {
  const index = ranked.findIndex((r) => r.bloc.name === bloc && r.d === d);
  return index === -1 ? undefined : index + 1;
}

// es-ES leaves four-digit numbers ungrouped by default; force it so columns line up.
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });
const share = (n: number) => ((n / validVotes) * 100).toLocaleString("es-ES", { maximumFractionDigits: 1 });

export function DhondtExample() {
  return (
    <section aria-labelledby="dhondt-title" className="depth-scope overflow-clip bg-canvas">
      <div className="mx-auto grid max-w-content gap-10 px-5 py-section sm:px-8 xl:grid-cols-[5fr_6fr] xl:items-center xl:gap-16 xl:py-32">
        <div style={cssVar("--d", 1.5)} className="depth rise-scope rise-unmask flex max-w-[44rem] flex-col gap-4">
          <h2 id="dhondt-title" className={`rise [--c:0] ${sectionTitle}`}>
            Así decide D’Hondt quién se lleva cada escaño
          </h2>
          <p className="rise text-body text-pretty text-ink-muted-80 [--c:1]">
            Los votos de cada partido se dividen entre 1, 2, 3… y los escaños van a los cocientes más
            altos. Solo compite quien alcanza al menos el 3 % de los votos válidos.
          </p>
        </div>
        <div style={cssVar("--d", -1.5)} className="depth flex min-w-0 flex-col gap-4">
          <p id="dhondt-caption" className="max-w-prose text-caption text-pretty text-ink-muted-80">
            Datos inventados: una provincia que reparte {SEATS} escaños. Cada recuadro oscuro es un
            escaño, numerado por orden de asignación.
          </p>
          <div
            role="region"
            aria-label="Tabla del ejemplo"
            tabIndex={0}
            className="zoom-in max-w-[52rem] overflow-x-auto rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-primary-focus"
          >
            <table aria-labelledby="dhondt-title" aria-describedby="dhondt-caption" className="w-full border-collapse text-left tabular-nums sm:min-w-[30rem]">
              <thead>
                <tr className="border-b border-hairline text-caption text-ink-muted-80">
                  <th scope="col" className="py-3 pr-1 font-normal sm:pr-4">Partido</th>
                  {DIVISORS.map((d) => (
                    <th key={d} scope="col" className="px-0.5 py-3 text-right font-normal sm:px-2">÷ {d}</th>
                  ))}
                  <th scope="col" className="py-3 pl-2 text-right font-normal sm:pl-3">Escaños</th>
                </tr>
              </thead>
              <tbody className="reveal-scope">
                {blocs.map((bloc) => (
                  <tr key={bloc.name} className="border-b border-hairline">
                    <th scope="row" className="py-4 pr-1 text-body font-semibold sm:pr-4">{bloc.name}</th>
                    {DIVISORS.map((d) => {
                      const order = seatOrder(bloc.name, d);
                      const q = Math.round(bloc.votes / d);
                      const out = bloc === firstOut.bloc && d === firstOut.d;
                      return (
                        <td key={d} className="px-0.5 py-3 text-right text-caption sm:px-2 sm:text-body">
                          {order ? (
                            <span
                              style={cssVar("--o", order)}
                              className="reveal-seat inline-flex items-baseline gap-px rounded-sm bg-ink px-1 py-1 text-on-dark sm:gap-1 sm:px-2"
                            >
                              {format(q)}
                              <sup className="text-fine-print">{order}.º</sup>
                              <span className="sr-only"> (escaño {order})</span>
                            </span>
                          ) : (
                            <span className={out ? "inline-block rounded-sm px-1 py-1 outline-1 -outline-offset-1 outline-ink-muted-48" : "px-1 text-ink-muted-80"}>
                              {format(q)}
                              {out && <span className="sr-only"> (primer cociente sin escaño)</span>}
                            </span>
                          )}
                        </td>
                      );
                    })}
                    <td className="py-3 pl-2 text-right text-body font-semibold sm:pl-3 sm:text-lead">
                      {ranked.filter((r) => r.bloc === bloc).length}
                    </td>
                  </tr>
                ))}
                <tr>
                  <th scope="row" className="py-4 pr-1 text-body font-normal text-ink-muted-80 sm:pr-4">{excluded.name}</th>
                  <td colSpan={DIVISORS.length + 1} className="py-4 pl-2 text-caption text-pretty text-ink-muted-80 sm:pl-3">
                    {format(excluded.votes)} votos ({share(excluded.votes)} %): no llega al 3 % y queda fuera del reparto.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <p className="max-w-prose text-caption text-pretty text-ink-muted-80">
            A y C empatan en 20.000 y el escaño es para los dos, así que el empate solo fija el orden.
            El recuadro claro es el primer cociente que se queda sin escaño.
          </p>
        </div>
      </div>
    </section>
  );
}
