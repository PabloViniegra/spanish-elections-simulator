type CoalitionCombinationsProps = {
  rows: readonly { members: string[]; seats: number }[];
  names: ReadonlyMap<string, string>;
  page: number;
  pages: number;
  total: number;
  onPage: (page: number) => void;
};

const pageButton = "min-h-11 px-3 font-semibold underline underline-offset-2 disabled:text-ink-muted-48 disabled:no-underline";

export function CoalitionCombinations({ rows, names, page, pages, total, onPage }: CoalitionCombinationsProps) {
  return (
    <>
      <p className="mb-2 text-ink-muted-80">Cada una pierde la mayoría si sale cualquiera de sus partidos.</p>
      <ul aria-label="Combinaciones mínimas" className="flex flex-col gap-1">
        {rows.map(({ members, seats }) => (
          <li key={members.join()} className="flex justify-between gap-4 border-b border-divider-soft py-1">
            <span>{members.map((id) => names.get(id)).join(" + ")}</span>
            <span className="tabular-nums">{seats}</span>
          </li>
        ))}
      </ul>
      {pages > 1 ? (
        <nav aria-label="Páginas de combinaciones" className="mt-3 flex flex-wrap items-center justify-between gap-2">
          <button type="button" disabled={page === 0} onClick={() => onPage(page - 1)} className={pageButton}>Anterior</button>
          <p role="status" className="tabular-nums">Página {page + 1} de {pages} · {total} combinaciones</p>
          <button type="button" disabled={page === pages - 1} onClick={() => onPage(page + 1)} className={pageButton}>Siguiente</button>
        </nav>
      ) : null}
    </>
  );
}
