import type { Bloc } from "@/lib/elections/types";
import { formatDelta, formatShare } from "./format";

type SharedSharesProps = {
  blocs: readonly Bloc[];
  baseLabel: string;
  shares: Readonly<Record<string, number>>;
  blank: number;
  others: number;
  seats: ReadonlyMap<string, number>;
  baseSeats: ReadonlyMap<string, number>;
};

// Read-only view of a shared scenario's estimate: the vote share behind each
// bloc's seats, which is what the link was sent to show.
export function SharedShares({ blocs, baseLabel, shares, blank, others, seats, baseSeats }: SharedSharesProps) {
  const rows = blocs.filter((bloc) => (shares[bloc.id] ?? 0) > 0 || (seats.get(bloc.id) ?? 0) > 0);
  return (
    <section aria-labelledby="estimacion-compartida" className="flex flex-col gap-2">
      <h2 id="estimacion-compartida" className="text-tagline">
        Estimación de voto
      </h2>
      <table className="w-full text-left tabular-nums">
        <caption className="sr-only">Porcentaje de voto válido y escaños de cada partido, con el cambio frente a {baseLabel}</caption>
        <thead className="text-fine-print text-ink-muted-80">
          <tr className="border-b border-hairline">
            <th scope="col" className="py-2 font-normal">
              Partido
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              % de voto
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              Escaños
            </th>
            <th scope="col" className="py-2 text-right font-normal">
              <span aria-hidden="true">vs. {baseLabel}</span>
              <span className="sr-only">Cambio frente a {baseLabel}</span>
            </th>
          </tr>
        </thead>
        <tbody>
          {rows.map((bloc) => {
            const blocSeats = seats.get(bloc.id) ?? 0;
            const delta = blocSeats - (baseSeats.get(bloc.id) ?? 0);
            return (
              <tr key={bloc.id} className="border-b border-hairline">
                <th scope="row" className="py-3 text-body font-semibold">
                  <span className="flex items-center gap-2">
                    <span aria-hidden="true" className="size-3 shrink-0 rounded-full" style={{ backgroundColor: bloc.colour }} />
                    {bloc.name}
                  </span>
                </th>
                <td className="py-3 text-right text-body">{formatShare(shares[bloc.id] ?? 0)}</td>
                <td className="py-3 text-right text-tagline">{blocSeats}</td>
                <td className={`py-3 text-right text-caption ${delta === 0 ? "text-ink-muted-80" : "font-semibold"}`}>{formatDelta(delta)}</td>
              </tr>
            );
          })}
        </tbody>
        <tfoot className="text-caption text-ink-muted-80">
          <tr className="border-b border-hairline">
            <th scope="row" className="py-3 font-normal">
              Voto en blanco
            </th>
            <td className="py-3 text-right">{formatShare(blank)}</td>
            <td colSpan={2} />
          </tr>
          <tr>
            <th scope="row" className="py-3 font-normal">
              Otros
            </th>
            <td className="py-3 text-right">{formatShare(others)}</td>
            <td colSpan={2} />
          </tr>
        </tfoot>
      </table>
    </section>
  );
}
