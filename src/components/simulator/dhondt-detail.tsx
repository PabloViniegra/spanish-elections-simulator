import Link from "next/link";
import { SelectField } from "@/components/forms/select-field";
import type { Bloc } from "@/lib/elections/types";
import type { dhondtDetail } from "@/lib/engine/last-seat";
import { formatVotes } from "./format";
import { QuotientTable } from "./quotient-table";

export const DHONDT_ID = "reparto-dhondt";

type DhondtDetailProps = {
  blocs: readonly Bloc[];
  provinces: readonly { code: string; name: string }[];
  code: string;
  deputies: number;
  detail: ReturnType<typeof dhondtDetail>;
  // Seats are out of date while the shares do not fit in 100%.
  stale: boolean;
  onSelect: (code: string) => void;
};

// FR-09: how D'Hondt hands out one province's seats in the simulation, which
// party took the last one and how many votes the next in line needs for it.
export function DhondtDetail({ blocs, provinces, code, deputies, detail, stale, onSelect }: DhondtDetailProps) {
  const blocById = new Map(blocs.map((bloc) => [bloc.id, bloc]));
  const nameOf = (id: string) => blocById.get(id)?.name ?? id;
  const province = provinces.find((candidate) => candidate.code === code)?.name;
  const { rows, lastSeat, runnerUp } = detail;
  return (
    <section id={DHONDT_ID} aria-labelledby="dhondt-title" className="flex scroll-mt-16 flex-col gap-4">
      <div className="flex flex-col gap-1">
        <h2 id="dhondt-title" className="text-tagline">
          Reparto D’Hondt por provincia
        </h2>
        <p className="max-w-prose text-caption text-pretty text-ink-muted-80">
          Cada partido que pasa el 3 % divide sus votos simulados entre 1, 2, 3… Cada resultado es un cociente, y los
          escaños van a los cocientes más altos.{" "}
          <Link href="/como-funciona" className="text-ink underline underline-offset-2">
            Cómo funciona
          </Link>
        </p>
      </div>
      <SelectField
        label="Provincia"
        hint={deputies === 1 ? "1 diputado." : `${deputies} diputados.`}
        value={code}
        onChange={(event) => onSelect(event.target.value)}
        options={provinces.map((option) => ({ value: option.code, label: option.name }))}
      />
      <div className={`flex flex-col gap-4 transition-opacity ${stale ? "opacity-40" : ""}`}>
        {lastSeat ? (
          <dl className="grid gap-x-6 gap-y-3 text-caption sm:grid-cols-2">
            <div>
              <dt className="text-ink-muted-80">Último escaño ({deputies === 1 ? "el único" : `el ${deputies}.º`})</dt>
              <dd className="font-semibold">
                {nameOf(lastSeat.candidacyId)}, con {formatVotes(lastSeat.quotient)}
                {lastSeat.decidedByLot && <span className="block font-normal">Empate decidido por sorteo.</span>}
              </dd>
            </div>
            {runnerUp && (
              <div>
                <dt className="text-ink-muted-80">Primero que se queda fuera</dt>
                <dd className="font-semibold">
                  {nameOf(runnerUp.candidacyId)}, con {formatVotes(runnerUp.quotient)}
                  <span className="block font-normal">
                    Le habrían hecho falta {formatVotes(runnerUp.votesToFlip)} votos más para ganar ese escaño a {nameOf(lastSeat.candidacyId)}.
                  </span>
                </dd>
              </div>
            )}
          </dl>
        ) : (
          <p className="text-caption">Ningún partido pasa el 3 % en {province}: los escaños quedan vacantes.</p>
        )}
        {rows.length > 0 && (
          <QuotientTable
            caption={`Cocientes D’Hondt en ${province}`}
            rows={rows}
            blocs={blocById}
            last={lastSeat}
            runnerUp={runnerUp}
          />
        )}
      </div>
    </section>
  );
}
