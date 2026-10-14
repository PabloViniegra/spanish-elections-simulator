import Link from "next/link";

type SimulationPagesProps = { page: number; pages: number };

const pageHref = (page: number) => (page === 1 ? "/profile" : `/profile?page=${page}`);
const step = "flex min-h-11 min-w-11 items-center text-caption font-semibold text-primary underline underline-offset-2";

export function SimulationPages({ page, pages }: SimulationPagesProps) {
  if (pages <= 1) return null;
  return (
    <nav aria-label="Páginas de simulaciones" className="flex items-center justify-between gap-4 pt-4">
      {page > 1 ? (
        <Link href={pageHref(page - 1)} rel="prev" className={step}>
          ← Anterior<span className="sr-only"> página</span>
        </Link>
      ) : (
        <span />
      )}
      <p className="text-caption text-ink-muted-80 tabular-nums">
        Página {page} de {pages}
      </p>
      {page < pages ? (
        <Link href={pageHref(page + 1)} rel="next" className={step}>
          Siguiente<span className="sr-only"> página</span> →
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
