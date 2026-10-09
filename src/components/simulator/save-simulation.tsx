"use client";

import { useState } from "react";
import { FormAlert } from "@/components/forms/form-alert";
import { TextField } from "@/components/forms/text-field";
import type { SaveState } from "@/lib/simulations/forms";
import { NAME_MAX } from "@/lib/simulations/limits";

// The saved simulation "Guardar cambios" overwrites.
export type SavedTarget = { id: string; name: string };

// The button that overwrites the saved simulation instead of adding one.
export const UPDATE_INTENT = "update";

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
  saved: SavedTarget | null;
};

const button =
  "min-h-11 rounded-full border border-ink px-[22px] text-body font-semibold transition-[scale,background-color,color] duration-200 ease-snappy active:scale-[0.97] disabled:border-ink-muted-48 disabled:bg-transparent disabled:text-ink-muted-48";

export function SaveSimulation({ state, action, pending, scenario, defaultName, stale, saved }: SaveSimulationProps) {
  // Which button sent the form, so only that one reads "Guardando…". Enter
  // clicks the first one too.
  const [updating, setUpdating] = useState(false);
  const label = (text: string, mine: boolean) => (pending && mine ? "Guardando…" : text);
  return (
    <form action={action} noValidate className="flex flex-col gap-3">
      <input type="hidden" name="scenario" value={scenario} />
      {saved && <input type="hidden" name="id" value={saved.id} />}
      <TextField
        label="Nombre de la simulación"
        name="name"
        defaultValue={saved?.name ?? defaultName}
        maxLength={NAME_MAX}
        required
        autoComplete="off"
        error={state?.fieldErrors?.name}
      />
      {saved && <p className="text-caption text-ink-muted-80">«Guardar cambios» sustituye «{saved.name}» en tu perfil por este reparto.</p>}
      {stale && <p className="text-caption text-ink-muted-80">Se guardará el último reparto que suma 100 %, el que muestran los resultados.</p>}
      <FormAlert message={state?.error ?? state?.fieldErrors?.scenario} />
      {/* Saving a copy comes first, so pressing Enter never overwrites. */}
      <div className="flex flex-wrap gap-3">
        <button type="submit" disabled={pending} onClick={() => setUpdating(false)} className={`${button} hover:bg-ink hover:text-on-dark`}>
          {label(saved ? "Guardar como nueva" : "Guardar en mi perfil", !updating)}
        </button>
        {saved && (
          <button
            type="submit"
            name="intent"
            value={UPDATE_INTENT}
            disabled={pending}
            onClick={() => setUpdating(true)}
            className={`${button} bg-ink text-on-dark hover:bg-transparent hover:text-ink`}
          >
            {label("Guardar cambios", updating)}
          </button>
        )}
      </div>
    </form>
  );
}
