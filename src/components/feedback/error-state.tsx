import Link from "next/link";

// Fallback for a page that failed to render; `digest` matches the server logs.
export function ErrorState({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  return (
    <main id="contenido" className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-display-md text-ink">Algo ha fallado</h1>
      <p className="max-w-md text-body text-ink-muted-80">
        No hemos podido cargar esta página. Puede ser un problema pasajero: vuelve a intentarlo en unos segundos.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-caption font-semibold text-on-primary transition-[background-color,scale] duration-200 ease-snappy hover:bg-primary-focus active:scale-[0.96]"
        >
          Reintentar
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center text-caption text-ink underline-offset-4 hover:underline">
          Volver al inicio
        </Link>
      </div>
      {digest && <p className="text-caption text-ink-muted-48">Código del error: {digest}</p>}
    </main>
  );
}
