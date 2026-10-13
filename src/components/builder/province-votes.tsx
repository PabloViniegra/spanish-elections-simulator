import { useId } from "react";
import { formatShare, formatVotes } from "@/components/simulator/format";
import type { BuiltParty, BuiltProvince } from "@/lib/builder/types";
import { PartyAcronym } from "./party-acronym";
import { VoteInput } from "./vote-input";

type ProvinceVotesProps = {
  provinceName: string;
  // Each with its votes here in the census election, when it ran.
  parties: readonly (BuiltParty & { fullName?: string; previous?: number })[];
  previousYear: string;
  // Parties of the list that never ran here.
  elsewhere: number;
  province: BuiltProvince;
  // Parties under the 3% threshold, as the engine counts it.
  excluded: ReadonlySet<string>;
  onRunning: (partyId: string, running: boolean) => void;
  onVotes: (partyId: string, votes: number) => void;
  onOther: (kind: "blank" | "null", votes: number) => void;
  onFill: () => void;
};

// Which parties run here and their votes, then blank and null votes.
export function ProvinceVotes({ provinceName, parties, previousYear, elsewhere, province, excluded, onRunning, onVotes, onOther, onFill }: ProvinceVotesProps) {
  const id = useId();
  const valid = Object.values(province.votes).reduce((sum, votes) => sum + votes, province.blank);
  const share = (votes: number) => (valid > 0 ? Math.round((votes / valid) * 10_000) : 0);

  return (
    <fieldset className="flex min-w-0 flex-col gap-4">
      <legend className="mb-2 text-tagline">Votos en {provinceName}</legend>
      <p className="text-caption text-ink-muted-80">
        Marca los partidos que se presentan y escribe sus votos. El 3 % se calcula sobre los votos válidos, que incluyen los votos en blanco.
        {elsewhere > 0 && ` ${elsewhere === 1 ? "Un partido de tu lista no se presentó" : `${elsewhere} partidos de tu lista no se presentaron`} nunca aquí.`}
      </p>
      <button type="button" onClick={onFill} className="min-h-11 w-fit rounded-full border border-ink px-5 text-caption font-semibold transition-colors duration-150 hover:bg-canvas-parchment">
        Rellenar los huecos con los votos de {previousYear}
      </button>
      <ul className="flex flex-col divide-y divide-hairline border-y border-hairline">
        {parties.map((party) => {
          const running = party.id in province.votes;
          const votes = province.votes[party.id] ?? 0;
          const below = votes > 0 && excluded.has(party.id);
          return (
            <li key={party.id} className="flex min-h-16 min-w-0 flex-wrap items-center gap-x-4 gap-y-2 py-2">
              <label className="flex min-h-11 min-w-0 basis-full cursor-pointer items-center gap-3 sm:flex-1 sm:basis-32">
                <input type="checkbox" checked={running} onChange={(event) => onRunning(party.id, event.target.checked)} className="size-5 shrink-0 accent-primary" />
                <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: party.colour }} />
                <span className="min-w-0 break-words [overflow-wrap:anywhere]">
                  <PartyAcronym acronym={party.name} name={party.fullName} />
                  <span className="sr-only"> se presenta en {provinceName}</span>
                  {party.previous !== undefined && <span className="block text-fine-print text-ink-muted-80">En {previousYear}: {formatVotes(party.previous)}</span>}
                </span>
              </label>
              {running && (
                <div className="ml-auto flex min-w-0 items-center gap-3">
                  <span id={`${id}-${party.id}`} className={`w-24 shrink-0 text-right text-caption tabular-nums ${below ? "text-error" : "text-ink-muted-80"}`}>
                    {formatShare(share(votes))}
                    {below && <span className="block text-fine-print">bajo el 3 %</span>}
                  </span>
                  <VoteInput id={`${id}-${party.id}-votes`} value={votes} label={`Votos de ${party.name}`} describedBy={`${id}-${party.id}`} onChange={(count) => onVotes(party.id, count)} />
                </div>
              )}
            </li>
          );
        })}
      </ul>
      <div className="flex flex-wrap gap-x-8 gap-y-4">
        {(["blank", "null"] as const).map((kind) => (
          <div key={kind} className="flex flex-col gap-2">
            <label htmlFor={`${id}-${kind}`} className="text-caption font-semibold">
              {kind === "blank" ? "Votos en blanco" : "Votos nulos"}
            </label>
            <VoteInput id={`${id}-${kind}`} value={province[kind]} onChange={(count) => onOther(kind, count)} />
          </div>
        ))}
      </div>
      <p className="text-caption text-ink-muted-80">Los votos en blanco cuentan para el 3 % pero no ganan escaños; los nulos no cuentan para nada.</p>
    </fieldset>
  );
}
