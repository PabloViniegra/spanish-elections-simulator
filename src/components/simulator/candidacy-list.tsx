import type { Bloc } from "@/lib/elections/types";
import { formatShare } from "./format";

export type CandidacyRow = { id: string; acronym: string; name: string; share: number; blocId: string | null };

type CandidacyListProps = {
  candidacies: readonly CandidacyRow[];
  blocs: readonly Bloc[];
  // Election the shares come from, e.g. "2023".
  baseLabel: string;
  onMove: (candidacyId: string, blocId: string | null) => void;
};

// Value of the "Others" option, apart from any bloc id.
const OTHERS = "";

// FR-11: every local candidacy of the base election and the bloc it counts
// with, largest first; regional lists can join their national party.
export function CandidacyList({ candidacies, blocs, baseLabel, onMove }: CandidacyListProps) {
  return (
    <details className="border-b border-hairline">
      <summary className="min-h-11 cursor-pointer py-3 text-caption font-semibold">Candidaturas y el partido con el que cuentan ({candidacies.length})</summary>
      <ul className="flex flex-col pb-2">
        {candidacies.map((candidacy) => (
          <li key={candidacy.id} className="grid grid-cols-[minmax(0,1fr)_minmax(0,11rem)] items-center gap-3 border-t border-hairline py-2">
            <label htmlFor={`candidacy-${candidacy.id}`} className="flex min-w-0 flex-col">
              <span className="text-caption font-semibold">
                {candidacy.acronym}{" "}
                <span className="font-normal text-ink-muted-80 tabular-nums">
                  {formatShare(Math.round(candidacy.share))}
                  <span className="sr-only"> en {baseLabel}</span>
                </span>
              </span>
              <span className="truncate text-fine-print text-ink-muted-80" title={candidacy.name}>
                {candidacy.name}
              </span>
            </label>
            <select
              id={`candidacy-${candidacy.id}`}
              value={candidacy.blocId ?? OTHERS}
              onChange={(event) => onMove(candidacy.id, event.target.value || null)}
              className="h-11 w-full min-w-0 rounded-sm border border-ink-muted-48 bg-canvas px-3 text-caption text-ink"
            >
              {blocs.map((bloc) => (
                <option key={bloc.id} value={bloc.id}>
                  {bloc.name}
                </option>
              ))}
              <option value={OTHERS}>Otros</option>
            </select>
          </li>
        ))}
      </ul>
    </details>
  );
}
