type CsvFilePickerProps = {
  // A new key after each import or cancel, so choosing the same file reads it again.
  inputKey: number;
  fileName: string | null;
  onTemplate: () => void;
  onChoose: (file: File | undefined) => void;
};

export function CsvFilePicker({ inputKey, fileName, onTemplate, onChoose }: CsvFilePickerProps) {
  return (
    <div className="flex flex-wrap items-center gap-3">
      <button type="button" onClick={onTemplate} className="min-h-11 rounded-full border border-ink px-5 text-caption font-semibold">
        Descargar la plantilla
      </button>
      <label className="inline-flex min-h-11 cursor-pointer items-center rounded-full bg-primary px-6 text-caption font-semibold text-on-primary transition-[background-color] duration-150 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-primary hover:bg-primary-focus">
        Elegir un archivo CSV
        <input key={inputKey} type="file" accept=".csv,text/csv" onChange={(event) => onChoose(event.target.files?.[0])} className="sr-only" />
      </label>
      {fileName && <span className="min-w-0 text-caption break-words text-ink-muted-80 [overflow-wrap:anywhere]">{fileName}</span>}
    </div>
  );
}
