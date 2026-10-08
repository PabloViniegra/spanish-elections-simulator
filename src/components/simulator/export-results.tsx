type ExportResultsProps = {
  stale: boolean;
  busy: boolean;
  onCsv: () => void;
  onPng: () => void;
};

// Sits in the same row as the share button: the parent is the group.
export function ExportResults({ stale, busy, onCsv, onPng }: ExportResultsProps) {
  const buttonClass = "min-h-11 rounded-full border border-hairline px-5 text-caption font-semibold transition-[background-color,scale] duration-150 hover:bg-canvas-parchment focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus active:scale-[0.96] motion-reduce:transition-none disabled:cursor-not-allowed disabled:text-ink-muted-80 disabled:active:scale-100";
  return (
    <>
      <button type="button" onClick={onCsv} disabled={stale || busy} className={buttonClass}>Descargar CSV</button>
      <button type="button" onClick={onPng} disabled={stale || busy} className={buttonClass}>{busy ? "Preparando PNG…" : "Descargar PNG"}</button>
      <p className="w-full text-fine-print text-ink-muted-80">
        CSV por provincia y partido; porcentaje del voto válido, incluido el voto en blanco y «Otros». PNG con el reparto completo, sin resaltar coaliciones.
      </p>
      {stale && <p role="status" className="w-full text-caption">Ajusta los porcentajes para descargar los resultados.</p>}
    </>
  );
}
