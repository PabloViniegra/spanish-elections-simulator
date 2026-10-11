import type { ComponentProps } from "react";
import type { ImportIssue } from "@/lib/builder/import";
import { CsvFilePicker } from "./csv-file-picker";
import { CsvImportIssues } from "./csv-import-issues";
import { CsvImportPreview } from "./csv-import-preview";
import { CsvImportProgress } from "./csv-import-progress";
import { CsvImportRules } from "./csv-import-rules";

export const IMPORT_ID = "importar";

type CsvImportProps = {
  censusYear: string;
  // Party names that would make two columns alike.
  clashes: readonly string[];
  picker: ComponentProps<typeof CsvFilePicker>;
  issues: readonly ImportIssue[] | null;
  // `replaced`: provinces with votes already, which the file replaces.
  preview: (Omit<ComponentProps<typeof CsvImportPreview>, "children"> & { replaced: number; onConfirm: () => void; onCancel: () => void }) | null;
  progress: ComponentProps<typeof CsvImportProgress> | null;
};

// Votes of the 52 provinces at once, from a spreadsheet that follows the template.
export function CsvImport({ censusYear, clashes, picker, issues, preview, progress }: CsvImportProps) {
  return (
    <section aria-labelledby={IMPORT_ID} className="scroll-mt-6 border-t border-hairline">
      <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-8 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,7fr)] lg:gap-16 lg:py-14">
        <div className="flex min-w-0 flex-col gap-4">
          <h2 id={IMPORT_ID} className="text-tagline">
            Importar votos desde un CSV
          </h2>
          <p className="text-caption text-ink-muted-80">
            Descarga la plantilla, rellénala en tu hoja de cálculo y súbela. Verás el resultado antes de reemplazar nada. Si hay un solo error, no se importa nada.
          </p>
          <CsvImportRules
            censusYear={censusYear}
            partyRule="Una columna por partido de tu lista, con su nombre exacto. Para añadir o quitar partidos, hazlo aquí y descarga otra plantilla."
          />
        </div>
        <div className="flex min-w-0 flex-col gap-6">
          {clashes.length > 0 ? (
            <p role="alert" className="text-caption text-error">
              Dos columnas se llamarían {clashes.map((name) => `«${name}»`).join(", ")}. Quita uno de esos partidos de tu lista para poder usar la plantilla.
            </p>
          ) : (
            <CsvFilePicker {...picker} />
          )}
          {issues && <CsvImportIssues issues={issues} />}
          {preview && (
            <CsvImportPreview rows={preview.rows} blank={preview.blank} valid={preview.valid}>
              <p className={`text-caption ${preview.replaced > 0 ? "text-error" : "text-ink-muted-80"}`}>
                {preview.replaced === 0
                  ? "Todavía no has escrito votos, así que no se pierde nada."
                  : `Se reemplazarán los votos de ${preview.replaced === 1 ? "la provincia que ya habías empezado" : `las ${preview.replaced} provincias que ya habías empezado`}. No se puede deshacer.`}
              </p>
              <div role="group" aria-label="Confirmar la importación" className="flex flex-wrap items-center gap-3">
                <button
                  type="button"
                  onClick={preview.onConfirm}
                  className="min-h-11 rounded-full bg-primary px-6 text-caption font-semibold text-on-primary transition-[background-color,scale] duration-150 hover:bg-primary-focus active:scale-[0.96]"
                >
                  {preview.replaced > 0 ? "Reemplazar los votos" : "Importar los votos"}
                </button>
                <button type="button" onClick={preview.onCancel} className="flex min-h-11 items-center text-caption font-semibold underline underline-offset-2">
                  Cancelar
                </button>
              </div>
            </CsvImportPreview>
          )}
          {progress && <CsvImportProgress {...progress} />}
        </div>
      </div>
    </section>
  );
}
