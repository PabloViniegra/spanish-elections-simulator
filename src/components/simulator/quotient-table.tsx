import type { Bloc } from "@/lib/elections/types";
import type { QuotientRow } from "@/lib/engine/last-seat";
import { formatVotes } from "./format";

type QuotientTableProps = {
  caption: string;
  rows: readonly QuotientRow[];
  blocs: ReadonlyMap<string, Bloc>;
  // The last seat handed out and the best quotient left, both highlighted.
  last: { candidacyId: string; divisor: number } | null;
  runnerUp: { candidacyId: string; divisor: number } | null;
};

const isCell = (target: { candidacyId: string; divisor: number } | null, candidacyId: string, divisor: number) =>
  target?.candidacyId === candidacyId && target.divisor === divisor;

// FR-09: votes divided by 1, 2, 3… for each party past the threshold. Winning
// quotients carry their place in the seat order; the last seat is filled in
// ink and the runner-up outlined, each also named in words.
export function QuotientTable({ caption, rows, blocs, last, runnerUp }: QuotientTableProps) {
  const columns = rows[0]?.quotients.length ?? 0;
  return (
    <>
      {columns > 6 && <p className="mb-1 text-fine-print text-ink-muted-80">Desliza de lado para ver todos los divisores.</p>}
      <div role="region" aria-label={caption} tabIndex={0} className="scroll-slim relative overflow-x-auto focus-visible:outline-offset-2">
        <table className="w-full border-collapse text-caption tabular-nums">
          <caption className="sr-only">{caption}</caption>
          <thead>
            <tr className="border-b border-hairline text-fine-print text-ink-muted-80">
              <th scope="col" className="sticky left-0 bg-canvas py-2 pr-3 text-left font-normal">
                Partido
              </th>
              <th scope="col" className="px-2 py-2 text-right font-normal">
                Votos
              </th>
              {Array.from({ length: columns }, (_, index) => (
                <th key={index} scope="col" className="px-2 py-2 text-right font-normal">
                  <span aria-hidden="true">÷</span>
                  <span className="sr-only">Entre </span>
                  {index + 1}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row) => {
              const bloc = blocs.get(row.candidacyId);
              return (
                <tr key={row.candidacyId} className="border-b border-hairline">
                  <th scope="row" className="sticky left-0 bg-canvas py-2 pr-3 text-left font-semibold whitespace-nowrap">
                    <span className="flex items-center gap-2">
                      <span aria-hidden="true" className="size-2.5 shrink-0 rounded-full" style={{ backgroundColor: bloc?.colour }} />
                      {bloc?.name ?? row.candidacyId}
                      <span className="font-normal text-ink-muted-80">{row.seats}</span>
                    </span>
                  </th>
                  <td className="px-2 py-2 text-right text-ink-muted-80">{formatVotes(row.votes)}</td>
                  {row.quotients.map((cell) => {
                    const lastSeat = isCell(last, row.candidacyId, cell.divisor);
                    const next = isCell(runnerUp, row.candidacyId, cell.divisor);
                    const tone = lastSeat
                      ? "bg-ink font-semibold text-on-dark"
                      : next
                        ? "outline-2 -outline-offset-2 outline-dashed outline-ink font-semibold"
                        : cell.seat
                          ? "font-semibold"
                          : "text-ink-muted-80";
                    return (
                      <td key={cell.divisor} className={`px-2 py-2 text-right whitespace-nowrap ${tone}`}>
                        {formatVotes(cell.quotient)}
                        {cell.seat && (
                          <span className="block text-fine-print font-normal">
                            escaño {cell.seat}
                            {cell.decidedByLot && ", por sorteo"}
                          </span>
                        )}
                        {lastSeat && <span className="sr-only">, último escaño</span>}
                        {next && <span className="block text-fine-print font-normal">queda fuera</span>}
                      </td>
                    );
                  })}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
}
