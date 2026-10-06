import { cssVar } from "@/lib/css-var";
import { sectionTitle } from "../home/type";

// The same invented five-seat province as the home page example.
const blocs = [
  { name: "Partido A", votes: 40000 },
  { name: "Partido B", votes: 30000 },
  { name: "Partido C", votes: 20000 },
];
const SEATS = 5;
const SHOWN = 7;

// Highest figures win; ties go to the bloc with more votes, as the LOREG sets.
const bids = blocs
  .flatMap((bloc) => [1, 2, 3].map((divisor) => ({ bloc, divisor, figure: Math.round(bloc.votes / divisor) })))
  .sort((a, b) => b.figure - a.figure || b.bloc.votes - a.bloc.votes)
  .slice(0, SHOWN);
// The seat numbers each bloc took, so the result points back to the rows above.
const won = (name: string) => bids.slice(0, SEATS).flatMap((bid, i) => (bid.bloc.name === name ? [i + 1] : []));
const format = (n: number) => n.toLocaleString("es-ES", { useGrouping: "always" });

export function DhondtAuction() {
  return (
    <section aria-labelledby="auction-title" className="depth-scope overflow-clip bg-canvas">
      <div className="mx-auto grid max-w-content gap-12 px-5 py-section sm:px-8 lg:grid-cols-[5fr_7fr] lg:items-center lg:gap-16 lg:py-40">
        <div className="rise-scope flex flex-col gap-5">
          <h2 id="auction-title" className={`rise [--c:0] ${sectionTitle}`}>
            Los escaños se reparten de uno en uno.
          </h2>
          <p className="rise max-w-[30rem] text-body text-pretty text-ink-muted-80 [--c:1]">
            Solo entran los partidos que superaron el 3 %, y cada uno empieza con una cifra: todos sus votos. En cada turno, el
            escaño se lo lleva la cifra más alta. Cuando un partido gana uno, su cifra se divide: entre 2 tras el primero, entre 3
            tras el segundo… Así hasta que no quedan escaños.
          </p>
          <p className="rise max-w-[30rem] text-caption text-pretty text-ink-muted-80 [--c:2]">
            Este método se llama D’Hondt.
          </p>
        </div>
        <figure className="flex flex-col gap-4">
          <ol aria-label="Cifras de mayor a menor" className="reveal-scope flex flex-col">
            {bids.map(({ bloc, divisor, figure }, i) => {
              const seat = i < SEATS;
              return (
                <li key={`${bloc.name}-${divisor}`} className={`flex items-center gap-3 border-b border-divider-soft py-2.5 ${i === SEATS ? "border-t-2 border-t-ink" : ""}`}>
                  <span
                    aria-hidden="true"
                    style={cssVar("--o", i)}
                    className={`grid size-9 shrink-0 place-items-center rounded-sm text-caption font-semibold ${seat ? "reveal-seat bg-ink text-on-dark" : "text-ink-muted-48"}`}
                  >
                    {seat ? `${i + 1}.º` : "—"}
                  </span>
                  <span className="flex min-w-0 flex-1 flex-col gap-1.5">
                    <span className="flex justify-between gap-3 text-caption">
                      <span className={seat ? "font-semibold" : "text-ink-muted-80"}>
                        {bloc.name}
                        <span className="font-normal text-ink-muted-80"> · {divisor === 1 ? "todos sus votos" : `sus votos entre ${divisor}`}</span>
                      </span>
                      <span className="tabular-nums">{format(figure)}</span>
                    </span>
                    <span aria-hidden="true" className="h-1.5 rounded-full bg-divider-soft">
                      <span style={{ width: `${(figure / bids[0].figure) * 100}%` }} className={`block h-full rounded-full ${seat ? "bg-ink" : "bg-ink-muted-48"}`} />
                    </span>
                  </span>
                  <span className="sr-only">{seat ? `: escaño ${i + 1}` : ": sin escaño"}</span>
                </li>
              );
            })}
          </ol>
          <dl aria-label="Resultado" className="reveal-scope grid grid-cols-3 gap-3 rounded-lg bg-canvas-parchment p-4 sm:p-5">
            {blocs.map(({ name }) => (
              <div key={name} className="flex flex-col gap-2">
                <dt className="text-caption text-ink-muted-80">{name}</dt>
                <dd className="flex flex-col gap-2">
                  <span className="text-body font-semibold tabular-nums sm:text-tagline">
                    {won(name).length} {won(name).length === 1 ? "escaño" : "escaños"}
                  </span>
                  <span aria-hidden="true" className="flex gap-1.5">
                    {won(name).map((seat) => (
                      <span
                        key={seat}
                        style={cssVar("--o", SEATS + seat)}
                        className="reveal-seat grid size-8 place-items-center rounded-sm bg-ink text-fine-print font-semibold text-on-dark"
                      >
                        {seat}.º
                      </span>
                    ))}
                  </span>
                </dd>
              </div>
            ))}
          </dl>
          <figcaption className="max-w-[36rem] text-caption text-pretty text-ink-muted-80">
            Ejemplo con datos inventados: una provincia con {SEATS} escaños. Bajo la raya, las cifras que se quedan sin escaño.
            Los dos 20.000 empatan: el 3.º va al Partido A, que tiene más votos. Si también empataran en votos, se sortearía.
          </figcaption>
        </figure>
      </div>
    </section>
  );
}
