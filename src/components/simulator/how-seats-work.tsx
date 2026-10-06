import Link from "next/link";

// Reference for the casual reader; the per-province tables are not built yet,
// so it points at the worked example on the home page instead.
export function HowSeatsWork() {
  return (
    <details className="border-b border-hairline text-caption">
      <summary className="min-h-11 cursor-pointer py-3 font-semibold">¿Cómo se convierten los votos en escaños?</summary>
      <div className="flex max-w-md flex-col gap-2 pb-4 text-pretty text-ink-muted-80">
        <p>Los 350 escaños se reparten en 52 circunscripciones: las 50 provincias, Ceuta y Melilla.</p>
        <p>
          En cada una se descartan las candidaturas con menos del 3 % de los votos válidos. Con las demás se aplica la regla D’Hondt: los votos
          de cada candidatura se dividen entre 1, 2, 3… y los escaños van a los cocientes más altos.
        </p>
        <p>
          <Link href="/#dhondt-title" className="text-ink underline underline-offset-2">
            Ver un ejemplo con cinco escaños
          </Link>
        </p>
      </div>
    </details>
  );
}
