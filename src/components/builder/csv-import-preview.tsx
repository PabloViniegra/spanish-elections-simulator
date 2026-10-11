import type { ReactNode } from "react";
import { formatShare, formatVotes } from "@/components/simulator/format";
import type { NationalRow } from "@/lib/builder/results";

type CsvImportPreviewProps = {
  rows: readonly NationalRow[];
  blank: number;
  valid: number;
  // What to do with it.
  children: ReactNode;
};

const share = (fraction: number) => formatShare(Math.round(fraction * 10_000));

// The Congreso the file would give, before anything is stored.
export function CsvImportPreview({ rows, blank, valid, children }: CsvImportPreviewProps) {
  return (
    <div className="settle flex min-w-0 flex-col gap-4">
      <p role="status" className="text-caption font-semibold">
        El archivo es correcto: 52 provincias y {formatVotes(valid)} votos válidos, {formatVotes(blank)} de ellos en blanco.
      </p>
      <table className="w-full text-caption tabular-nums">
        <caption className="sr-only">Votos, porcentaje del voto válido y escaños de cada partido con los votos del archivo</caption>
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
                <span className="flex min-w-0 items-center gap-2">
                  <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: row.colour }} />
                  <span className="min-w-0 break-words [overflow-wrap:anywhere]">{row.name}</span>
                </span>
              </th>
              <td className="py-2 pr-4 text-right">{formatVotes(row.votes)}</td>
              <td className="py-2 pr-4 text-right">{share(row.share)}</td>
              <td className="py-2 text-right font-semibold">{row.seats}</td>
            </tr>
          ))}
        </tbody>
      </table>
      {children}
    </div>
  );
}
