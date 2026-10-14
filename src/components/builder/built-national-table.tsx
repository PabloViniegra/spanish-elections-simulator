import type { NationalRow } from "@/lib/builder/results";
import { formatShare, formatVotes } from "@/components/simulator/format";
import { PartyAcronym } from "./party-acronym";

type BuiltNationalTableProps = {
  rows: readonly (NationalRow & { fullName?: string })[];
  blank: number;
  blankShare: number;
};

const share = (fraction: number) => formatShare(Math.round(fraction * 10_000));

export function BuiltNationalTable({ rows, blank, blankShare }: BuiltNationalTableProps) {
  return (
    <section aria-labelledby="resultado-nacional" className="flex flex-col gap-4">
      <h2 id="resultado-nacional" className="text-tagline">
        Resultado en toda España
      </h2>
      <table className="w-full text-caption tabular-nums">
        <caption className="sr-only">Votos, porcentaje del voto válido y escaños de cada partido</caption>
        <thead className="text-left text-ink-muted-80">
          <tr className="border-b border-hairline">
            <th scope="col" className="py-2 pr-4 font-normal">Partido</th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">Votos</th>
            <th scope="col" className="py-2 pr-4 text-right font-normal">%</th>
            <th scope="col" className="py-2 text-right font-normal">Escaños</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.id} className="border-b border-divider-soft">
              <th scope="row" className="py-2 pr-4 text-left font-normal">
                <span className="flex items-center gap-2">
                  <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: row.colour }} />
                  <PartyAcronym acronym={row.name} name={row.fullName} />
                </span>
              </th>
              <td className="py-2 pr-4 text-right">{formatVotes(row.votes)}</td>
              <td className="py-2 pr-4 text-right">{share(row.share)}</td>
              <td className="py-2 text-right font-semibold">{row.seats}</td>
            </tr>
          ))}
          <tr className="text-ink-muted-80">
            <th scope="row" className="py-2 pr-4 text-left font-normal">Votos en blanco</th>
            <td className="py-2 pr-4 text-right">{formatVotes(blank)}</td>
            <td className="py-2 pr-4 text-right">{share(blankShare)}</td>
            <td className="py-2 text-right">—</td>
          </tr>
        </tbody>
      </table>
    </section>
  );
}
