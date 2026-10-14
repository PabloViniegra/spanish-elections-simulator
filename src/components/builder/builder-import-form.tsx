import type { ComponentProps } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import type { ImportIssue } from "@/lib/builder/import";
import type { BuiltScenario, SeatTable } from "@/lib/builder/types";
import type { SaveState } from "@/lib/simulations/forms";
import { NAME_MAX } from "@/lib/simulations/limits";
import { CsvFilePicker } from "./csv-file-picker";
import { CsvImportIssues } from "./csv-import-issues";
import { CsvImportPreview } from "./csv-import-preview";
import { CsvImportProgress } from "./csv-import-progress";
import { CsvImportRules } from "./csv-import-rules";
import { SeatTableChoice } from "./seat-table-choice";

type BuilderImportFormProps = {
  state: SaveState;
  action: (formData: FormData) => void;
  pending: boolean;
  censusYear: string;
  name: string;
  seatTable: SeatTable;
  onName: (name: string) => void;
  onSeatTable: (seatTable: SeatTable) => void;
  picker: ComponentProps<typeof CsvFilePicker>;
  issues: readonly ImportIssue[] | null;
  scenario: BuiltScenario | null;
  preview: Omit<ComponentProps<typeof CsvImportPreview>, "children"> | null;
  onCancel: () => void;
};

const STEPS = ["Archivo comprobado", "Elecciones creadas en tu perfil"] as const;

export function BuilderImportForm(props: BuilderImportFormProps) {
  const { state, scenario, preview } = props;
  return (
    <form action={props.action} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:gap-16">
      <div className="flex flex-col gap-8">
        <TextField
          label="Nombre"
          name="name"
          value={props.name}
          onChange={(event) => props.onName(event.target.value)}
          maxLength={NAME_MAX}
          required
          error={state?.fieldErrors?.name}
          hint="Así aparecerá en tu perfil."
        />
        <SeatTableChoice value={props.seatTable} onChange={props.onSeatTable} />
        <div className="flex flex-col gap-3">
          <h2 className="text-caption font-semibold">Reglas del archivo</h2>
          <CsvImportRules
            censusYear={props.censusYear}
            partyRule="Una columna por partido, con su sigla exacta del catálogo (por ejemplo PP, PSOE o EH Bildu). No se pueden crear partidos propios desde el archivo."
          />
        </div>
      </div>
      <div className="flex min-w-0 flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <p className="text-caption text-ink-muted-80">
          La plantilla trae los partidos más votados de {props.censusYear}; cambia o añade columnas con otras siglas del catálogo. Verás el resultado antes de crear nada. Si hay un solo error, no se importa nada.
        </p>
        <CsvFilePicker {...props.picker} />
        {props.issues && <CsvImportIssues issues={props.issues} />}
        {scenario && preview && (
          <CsvImportPreview {...preview}>
            <input type="hidden" name="parties" value={JSON.stringify(scenario.parties)} />
            <input type="hidden" name="provinces" value={JSON.stringify(scenario.provinces)} />
            <FormAlert message={state?.error ?? state?.fieldErrors?.seatTable} />
            {props.pending ? (
              <CsvImportProgress steps={STEPS} done={1} label="Creando las elecciones…" />
            ) : (
              <div className="flex flex-col gap-3">
                <SubmitButton pending={props.pending} label="Crear las elecciones con estos votos" pendingLabel="Creando…" />
                <button type="button" onClick={props.onCancel} className="flex min-h-11 w-fit items-center text-caption font-semibold underline underline-offset-2">
                  Elegir otro archivo
                </button>
              </div>
            )}
          </CsvImportPreview>
        )}
      </div>
    </form>
  );
}
