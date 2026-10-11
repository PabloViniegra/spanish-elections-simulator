import { formatVotes } from "@/components/simulator/format";
import { QuotientTable } from "@/components/simulator/quotient-table";
import type { Bloc } from "@/lib/elections/types";
import { dhondtDetail } from "@/lib/engine/last-seat";
import type { ConstituencyResult } from "@/lib/engine/types";

type ProvinceAllocationProps = {
  provinceName: string;
  result: ConstituencyResult;
  blocs: ReadonlyMap<string, Bloc>;
};

// The province's seats as they stand, redrawn on every keystroke.
export function ProvinceAllocation({ provinceName, result, blocs }: ProvinceAllocationProps) {
  const { rows, lastSeat, runnerUp } = dhondtDetail(result);
  const nameOf = (id: string) => blocs.get(id)?.name ?? id;
  const winners = result.candidacies.filter(({ seats }) => seats > 0).sort((a, b) => b.seats - a.seats || b.votes - a.votes);

  return (
    <section aria-labelledby="reparto" className="flex min-w-0 flex-col gap-4">
      <h2 id="reparto" className="scroll-mt-6 text-tagline">
        Reparto en {provinceName}
      </h2>
      <div aria-live="polite" className="flex flex-col gap-2">
        {winners.length > 0 ? (
          <ul className="flex flex-col gap-2">
            {winners.map(({ id, seats }) => (
              <li key={id} className="flex min-w-0 items-center gap-3">
                <span aria-hidden className="h-3 w-24 shrink-0">
                  <span className="block h-full min-w-3 rounded-full" style={{ backgroundColor: blocs.get(id)?.colour, width: `${(seats / result.seats) * 100}%` }} />
                </span>
                <span className="min-w-0 break-words text-caption [overflow-wrap:anywhere]">
                  <span className="font-semibold">{nameOf(id)}</span> {seats === 1 ? "1 escaño" : `${seats} escaños`}
                </span>
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-caption text-ink-muted-80">Ningún partido pasa el 3 % todavía: los escaños quedan vacantes.</p>
        )}
        {winners.length > 0 && result.vacantSeats > 0 && (
          <p className="text-caption">{result.vacantSeats === 1 ? "1 escaño vacante." : `${result.vacantSeats} escaños vacantes.`}</p>
        )}
      </div>
      {lastSeat && (
        <dl className="grid gap-3 break-words text-caption [overflow-wrap:anywhere] sm:grid-cols-2">
          <div>
            <dt className="text-ink-muted-80">Último escaño</dt>
            <dd className="font-semibold">
              {nameOf(lastSeat.candidacyId)}, con {formatVotes(lastSeat.quotient)}
              {lastSeat.decidedByLot && <span className="block font-normal">Empate decidido por sorteo.</span>}
            </dd>
          </div>
          {runnerUp && (
            <div>
              <dt className="text-ink-muted-80">Primero que se queda fuera</dt>
              <dd className="font-semibold">
                {nameOf(runnerUp.candidacyId)}
                <span className="block font-normal">Le faltan {formatVotes(runnerUp.votesToFlip)} votos para ese escaño.</span>
              </dd>
            </div>
          )}
        </dl>
      )}
      {rows.length > 0 && (
        <details className="min-w-0">
          <summary className="min-h-11 cursor-pointer py-3 text-caption font-semibold">Ver los cocientes D’Hondt</summary>
          <QuotientTable caption={`Cocientes D’Hondt en ${provinceName}`} rows={rows} blocs={blocs} last={lastSeat} runnerUp={runnerUp} />
        </details>
      )}
    </section>
  );
}
