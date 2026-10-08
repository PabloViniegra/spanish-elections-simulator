type ExportResultsProps = {
  stale: boolean;
  busy: boolean;
  onCsv: () => void;
  onPng: () => void;
};

export function ExportResults({ stale, busy, onCsv, onPng }: ExportResultsProps) {
  const buttonClass = "min-h-11 rounded-sm border border-hairline px-4 text-caption font-semibold transition-[background-color,scale] duration-150 hover:bg-canvas-parchment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus active:scale-[0.96] motion-reduce:transition-none disabled:cursor-not-allowed disabled:text-ink-muted-80 disabled:active:scale-100";
  return (
    <div className="flex flex-col gap-2">
      <div role="group" aria-label="Descargar resultados" className="flex flex-wrap gap-3">
        <button type="button" onClick={onCsv} disabled={stale || busy} className={buttonClass}>Descargar CSV</button>
        <button type="button" onClick={onPng} disabled={stale || busy} className={buttonClass}>{busy ? "Preparando PNG…" : "Descargar PNG"}</button>
      </div>
      <p className="text-caption text-ink-muted-80">
        CSV por provincia y partido; porcentaje del voto válido, incluido el voto en blanco y «Otros». PNG con el reparto completo, sin resaltar coaliciones.
      </p>
      {stale && <p role="status" className="text-caption">Ajusta los porcentajes para descargar los resultados.</p>}
    </div>
  );
}
