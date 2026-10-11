import { FormAlert } from "@/components/forms/form-alert";
import { SubmitButton } from "@/components/forms/submit-button";
import { TextField } from "@/components/forms/text-field";
import { NO_PARTIES } from "@/lib/builder/save";
import type { BuiltParty, CatalogParty, SeatTable } from "@/lib/builder/types";
import type { SaveState } from "@/lib/simulations/forms";
import { NAME_MAX } from "@/lib/simulations/limits";
import { CustomPartyAdder } from "./custom-party-adder";
import { PartyPicker } from "./party-picker";
import { SeatTableChoice } from "./seat-table-choice";
import { SelectedParties } from "./selected-parties";

type BuilderSetupFormProps = {
  state: SaveState;
  action: (formData: FormData) => void;
  pending: boolean;
  catalog: readonly CatalogParty[];
  catalogById: ReadonlyMap<string, CatalogParty>;
  name: string;
  seatTable: SeatTable;
  parties: readonly BuiltParty[];
  full: boolean;
  onName: (name: string) => void;
  onSeatTable: (seatTable: SeatTable) => void;
  onAddCatalog: (party: CatalogParty) => void;
  onAddCustom: (name: string) => void;
  onRecolour: (id: string, colour: string) => void;
  onRemove: (id: string) => void;
};

// A list rejected for being empty is fixed once a party is added.
const noLongerEmpty = (state: SaveState, count: number) => count > 0 && state?.fieldErrors?.parties === NO_PARTIES;

export function BuilderSetupForm(props: BuilderSetupFormProps) {
  const { state, parties } = props;
  return (
    <form action={props.action} noValidate className="grid grid-cols-[minmax(0,1fr)] gap-12 lg:grid-cols-[minmax(0,6fr)_minmax(0,5fr)] lg:gap-16">
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
        <PartyPicker catalog={props.catalog} chosen={new Set(parties.flatMap(({ catalogId }) => catalogId ?? []))} full={props.full} onAdd={props.onAddCatalog} />
        {parties.length > 0 && <a href="#partidos-elegidos" className="inline-flex min-h-11 w-fit items-center text-caption font-semibold underline underline-offset-4">{parties.length} {parties.length === 1 ? "partido elegido" : "partidos elegidos"} · Revisar lista</a>}
        <CustomPartyAdder full={props.full} onAdd={props.onAddCustom} />
      </div>
      <div className="flex flex-col gap-6 lg:sticky lg:top-8 lg:self-start">
        <SelectedParties
          parties={parties}
          catalog={props.catalogById}
          error={noLongerEmpty(state, parties.length) ? undefined : (state?.fieldErrors?.parties ?? state?.fieldErrors?.seatTable)}
          onRecolour={props.onRecolour}
          onRemove={props.onRemove}
        />
        <input type="hidden" name="parties" value={JSON.stringify(parties)} />
        <FormAlert message={state?.error} />
        <SubmitButton pending={props.pending} label="Crear y empezar por la primera provincia" pendingLabel="Creando…" />
      </div>
    </form>
  );
}
