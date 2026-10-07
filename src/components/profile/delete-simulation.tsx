"use client";

import { useState, useTransition } from "react";
import { deleteSimulation } from "@/lib/simulations/actions";

// Deleting cannot be undone, so it asks once more before going ahead.
export function DeleteSimulation({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [pending, startTransition] = useTransition();
  const button = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${button} text-error`}>
        Eliminar<span className="sr-only"> «{name}»</span>
      </button>
    );
  }
  return (
    <div role="group" aria-label={`¿Eliminar «${name}»?`} className="flex items-center gap-4">
      <span className="text-caption">¿Eliminar?</span>
      <button
        type="button"
        autoFocus
        disabled={pending}
        onClick={() => startTransition(() => deleteSimulation(id))}
        className={`${button} text-error disabled:text-ink-muted-48`}
      >
        {pending ? "Eliminando…" : "Sí, eliminar"}
      </button>
      <button type="button" disabled={pending} onClick={() => setConfirming(false)} className={button}>
        Cancelar
      </button>
    </div>
  );
}
