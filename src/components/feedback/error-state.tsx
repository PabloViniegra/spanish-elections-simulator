import Link from "next/link";
import { CONTACT_EMAIL } from "@/lib/legal";

// The report names the error by its `digest`, which matches the server logs.
function reportHref(digest: string) {
  const subject = `Problema en el Simulador de Elecciones (código ${digest})`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}`;
}

// Fallback for a page that failed to render or an action that failed past its form.
export function ErrorState({ digest, onRetry }: { digest?: string; onRetry: () => void }) {
  return (
    <main id="contenido" className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-24 text-center">
      <h1 className="text-display-md text-ink">Algo ha fallado</h1>
      <p className="max-w-md text-body text-pretty text-ink-muted-80">
        No hemos podido completar lo que pedías. Suele ser un problema pasajero: vuelve a intentarlo en unos segundos.
      </p>
      <div className="flex flex-wrap items-center justify-center gap-4">
        <button
          type="button"
          onClick={onRetry}
          className="inline-flex min-h-11 items-center justify-center rounded-full bg-primary px-6 text-caption font-semibold text-on-primary transition-[background-color,scale] duration-150 ease-snappy hover:bg-primary-focus active:scale-[0.96]"
        >
          Reintentar
        </button>
        <Link href="/" className="inline-flex min-h-11 items-center text-caption text-ink underline-offset-4 hover:underline">
          Volver al inicio
        </Link>
      </div>
      {digest && (
        <p className="max-w-md text-caption text-pretty text-ink-muted-80">
          Si sigue fallando,{" "}
          <a href={reportHref(digest)} className="underline underline-offset-2">
            avísanos
          </a>{" "}
          con el código <span className="tabular-nums">{digest}</span>.
        </p>
      )}
    </main>
  );
}
