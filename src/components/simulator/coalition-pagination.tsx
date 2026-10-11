type CoalitionPaginationProps = {
  page: number;
  pages: number;
  total: number;
  busy: boolean;
  position: "inicio" | "final";
  onPage: (page: number) => void;
};

const button = "min-h-11 px-3 font-semibold underline underline-offset-2 disabled:text-ink-muted-48 disabled:no-underline";

export function CoalitionPagination({ page, pages, total, busy, position, onPage }: CoalitionPaginationProps) {
  return (
    <nav aria-label={`Páginas de combinaciones (${position})`} className="my-3 flex flex-wrap items-center justify-between gap-2">
      <p role={position === "inicio" ? "status" : undefined} className="w-full tabular-nums">{busy ? "Calculando página…" : `Página ${page + 1} de ${pages} · ${total} combinaciones`}</p>
      {pages > 1 && <>
        <button type="button" disabled={page === 0} aria-disabled={busy || page === 0} onClick={() => { if (!busy) onPage(page - 1); }} className={button}>Anterior</button>
        <button type="button" disabled={page === pages - 1} aria-disabled={busy || page === pages - 1} onClick={() => { if (!busy) onPage(page + 1); }} className={button}>Siguiente</button>
      </>}
    </nav>
  );
}
