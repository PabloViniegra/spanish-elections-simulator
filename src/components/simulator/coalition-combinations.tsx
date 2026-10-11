import { CoalitionPagination } from "./coalition-pagination";

type CoalitionCombinationsProps = {
  rows: readonly { members: string[]; seats: number }[];
  names: ReadonlyMap<string, string>;
  page: number;
  pages: number;
  total: number;
  busy?: boolean;
  onPage: (page: number) => void;
};

export function CoalitionCombinations({ rows, names, page, pages, total, busy = false, onPage }: CoalitionCombinationsProps) {
  const pagination = { page, pages, total, busy, onPage };
  return (
    <>
      <p className="mb-2 text-ink-muted-80">Cada una pierde la mayoría si sale cualquiera de sus partidos.</p>
      <CoalitionPagination {...pagination} position="inicio" />
      <ul aria-label="Combinaciones mínimas" aria-busy={busy} className="flex flex-col gap-1">
        {rows.map(({ members, seats }) => (
          <li key={members.join()} className="flex justify-between gap-4 border-b border-divider-soft py-1">
            <span className="min-w-0 break-words [overflow-wrap:anywhere]">{members.map((id) => names.get(id)).join(" + ")}</span>
            <span className="shrink-0 tabular-nums">{seats}</span>
          </li>
        ))}
      </ul>
      {pages > 1 && <CoalitionPagination {...pagination} position="final" />}
    </>
  );
}
