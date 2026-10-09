import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/text-field";
import type { SaveState } from "@/lib/simulations/forms";
import { NAME_MAX } from "@/lib/simulations/limits";

type SaveSimulationProps = {
  state: SaveState;
  action: (formData: FormData) => void;
  pending: boolean;
  // The scenario as its URL parameter.
  scenario: string;
  // A name to start from, so saving takes one click.
  defaultName: string;
  // The inputs do not add up to 100%: what gets saved is the last scenario that did.
  stale: boolean;
};

export function SaveSimulation({ state, action, pending, scenario, defaultName, stale }: SaveSimulationProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <input type="hidden" name="scenario" value={scenario} />
      <TextField
        label="Nombre de la simulación"
        name="name"
        defaultValue={defaultName}
        maxLength={NAME_MAX}
        required
        autoComplete="off"
        error={state?.fieldErrors?.name}
      />
      {stale && <p className="text-caption text-ink-muted-80">Se guardará el último reparto que suma 100 %, el que muestran los resultados.</p>}
      <FormAlert message={state?.error ?? state?.fieldErrors?.scenario} />
      <button
        type="submit"
        disabled={pending}
        className="self-start min-h-11 rounded-full border border-ink px-[22px] text-body font-semibold transition-[scale,background-color,color] duration-200 ease-snappy hover:bg-ink hover:text-on-dark active:scale-[0.97] disabled:border-ink-muted-48 disabled:bg-transparent disabled:text-ink-muted-48"
      >
        {pending ? "Guardando…" : "Guardar en mi perfil"}
      </button>
    </form>
  );
}
