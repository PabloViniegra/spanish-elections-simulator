type Figure = { id: string; votes: number; divisor: number; quotient: number };
type Round = { seat: number; winner: string; figures: Figure[] };
type Result = { id: string; name: string; votes: number; seats: number };

const format = (value: number) => Math.round(value).toLocaleString("es-ES", { useGrouping: "always" });

export function DhondtRounds({ rounds, results }: { rounds: Round[]; results: Result[] }) {
  return (
    <figure className="flex min-w-0 flex-col gap-4">
      <div className="flex flex-col gap-2">
        <h3 id="dhondt-rounds-title" className="text-tagline font-semibold">5 escaños, turno a turno</h3>
        <p id="dhondt-rounds-help" className="text-caption text-pretty text-ink-muted-80">
          Lee de arriba abajo. En cada fila, el recuadro oscuro gana ese escaño. Su divisor aumenta en la fila siguiente.
        </p>
      </div>
      <table aria-labelledby="dhondt-rounds-title" aria-describedby="dhondt-rounds-help dhondt-rounds-note" className="w-full table-fixed border-collapse text-center tabular-nums">
        <thead>
          <tr className="border-b border-divider-soft">
            <th scope="col" className="w-10 py-3 text-left text-fine-print font-normal text-ink-muted-80 sm:w-16 sm:text-caption">Escaño</th>
            {results.map((bloc) => (
              <th key={bloc.id} scope="col" className="px-1 py-3 text-caption font-semibold">
                {bloc.name}
                <span className="mt-1 block text-fine-print font-normal text-ink-muted-80">{format(bloc.votes)} votos</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rounds.map((round) => (
            <tr key={round.seat} className="border-b border-divider-soft">
              <th scope="row" className="py-3 text-left text-caption font-semibold">{round.seat}.º</th>
              {round.figures.map((figure) => {
                const winner = figure.id === round.winner;
                return (
                  <td key={figure.id} className="px-0.5 py-2 sm:px-1 sm:py-3">
                    <div className={`flex flex-col gap-1 rounded-sm px-0.5 py-2 sm:px-2 ${winner ? "bg-ink text-on-dark" : "text-ink-muted-80"}`}>
                      <span className="text-fine-print">{format(figure.votes)} ÷ {figure.divisor}</span>
                      <span className="text-caption font-semibold sm:text-body">{format(figure.quotient)}</span>
                      <span className="text-fine-print">{winner ? "Gana" : "—"}</span>
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
      <p className="text-caption text-pretty text-ink-muted-80">
        Por ejemplo: A gana el 1.º con 40.000. En el siguiente turno compite con 40.000 ÷ 2 = 20.000,
        así que el 2.º lo gana B con 30.000.
      </p>
      <dl aria-label="Resultado final" className="grid grid-cols-3 gap-3 rounded-lg bg-canvas-parchment p-4 sm:p-5">
        {results.map((bloc) => (
          <div key={bloc.id} className="flex flex-col gap-2">
            <dt className="text-caption text-ink-muted-80">{bloc.name}</dt>
            <dd className="text-body font-semibold sm:text-tagline">{bloc.seats} {bloc.seats === 1 ? "escaño" : "escaños"}</dd>
          </div>
        ))}
      </dl>
      <figcaption id="dhondt-rounds-note" className="text-caption text-pretty text-ink-muted-80">
        Ejemplo con datos inventados. En el 3.º turno, A y C empatan a 20.000: va primero A porque tiene más votos
        originales. C recibe el siguiente escaño. Aquí el empate solo ordena los escaños, porque los dos lo consiguen; solo decide
        algo cuando queda un único escaño en juego.
      </figcaption>
    </figure>
  );
}
