import Link from "next/link";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/text-field";
import { NAME_MAX, type SaveState } from "@/lib/simulations/forms";

type SaveSimulationProps = {
  state: SaveState;
  action: (formData: FormData) => void;
  pending: boolean;
  // The scenario as its URL parameter.
  scenario: string;
};

export function SaveSimulation({ state, action, pending, scenario }: SaveSimulationProps) {
  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <input type="hidden" name="scenario" value={scenario} />
      <TextField
        label="Nombre del simulacro"
        name="name"
        maxLength={NAME_MAX}
        required
        autoComplete="off"
        error={state?.fieldErrors?.name}
      />
      <FormAlert message={state?.error ?? state?.fieldErrors?.scenario} />
      <div className="flex flex-wrap items-center gap-x-4 gap-y-2">
        <button
          type="submit"
          disabled={pending}
          className="min-h-11 rounded-full border border-ink px-[22px] text-body font-semibold transition-[scale,background-color,color] duration-200 ease-snappy hover:bg-ink hover:text-on-dark active:scale-[0.97] disabled:border-ink-muted-48 disabled:bg-transparent disabled:text-ink-muted-48"
        >
          {pending ? "Guardando…" : "Guardar en mi perfil"}
        </button>
        <p aria-live="polite" className="text-caption text-ink-muted-80">
          {state?.saved && (
            <>
              Guardado como «{state.saved}».{" "}
              <Link href="/perfil" className="text-primary underline">
                Ver mis simulacros
              </Link>
            </>
          )}
        </p>
      </div>
    </form>
  );
}
