"use client";

import { useState } from "react";

// The list heading: once a row is gone, focus lands there instead of on the
// page body.
export const LIST_HEADING_ID = "simulaciones";

// Deleting cannot be undone, so it asks once more before going ahead.
export function DeleteSimulation({ name, pending, onDelete }: { name: string; pending: boolean; onDelete: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const button = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${button} text-error`}>
        Eliminar<span className="sr-only"> «{name}»</span>
      </button>
    );
  }
  return (
    <div data-confirming="" data-deleting={pending ? "" : undefined} className="settle flex flex-col gap-1">
      <div role="group" aria-label={`Confirmar eliminación de «${name}»`} className="flex flex-wrap items-center gap-x-4">
        <span className="text-caption">¿Eliminar? No se puede deshacer.</span>
        <button type="button" disabled={pending} onClick={onDelete} className={`${button} text-error disabled:text-ink-muted-48`}>
          {pending ? "Eliminando…" : "Sí, eliminar"}
        </button>
        <button
          type="button"
          autoFocus
          disabled={pending}
          onClick={() => setConfirming(false)}
          className={button}
        >
          Cancelar
        </button>
      </div>
      <p role="status" className="sr-only">
        {pending && "Eliminando…"}
      </p>
    </div>
  );
}
