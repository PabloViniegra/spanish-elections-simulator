import type { RefObject } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/text-field";
import type { SaveState } from "@/lib/simulations/forms";
import { NAME_MAX } from "@/lib/simulations/limits";

const link = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

export function RenameButton({ name, buttonRef, onClick }: { name: string; buttonRef: RefObject<HTMLButtonElement | null>; onClick: () => void }) {
  return (
    <button ref={buttonRef} type="button" onClick={onClick} className={link}>
      Renombrar<span className="sr-only"> «{name}»</span>
    </button>
  );
}

type RenameSimulationProps = {
  id: string;
  name: string;
  state: SaveState;
  action: (formData: FormData) => void;
  pending: boolean;
  onCancel: () => void;
};

// Takes a line of its own below the row actions.
export function RenameSimulation({ id, name, state, action, pending, onCancel }: RenameSimulationProps) {
  return (
    <form action={action} noValidate aria-label={`Renombrar «${name}»`} className="settle order-last flex basis-full flex-col gap-3">
      <input type="hidden" name="id" value={id} />
      <TextField
        label="Nuevo nombre"
        name="name"
        defaultValue={name}
        maxLength={NAME_MAX}
        required
        autoComplete="off"
        autoFocus
        error={state?.fieldErrors?.name}
      />
      <FormAlert message={state?.error} />
      <div className="flex flex-wrap items-center gap-x-4">
        <button type="submit" disabled={pending} className={`${link} text-primary disabled:text-ink-muted-48`}>
          {pending ? "Guardando…" : "Guardar nombre"}
        </button>
        <button type="button" disabled={pending} onClick={onCancel} className={link}>
          Cancelar
        </button>
      </div>
    </form>
  );
}
