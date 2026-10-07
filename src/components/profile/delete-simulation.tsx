"use client";

import { useState, useTransition } from "react";
import { deleteSimulation } from "@/lib/simulations/actions";

// The list heading and its status line: once a row is gone, focus and the
// announcement land there instead of on the page body.
export const LIST_HEADING_ID = "simulaciones";
export const LIST_STATUS_ID = "simulaciones-estado";

// Deleting cannot be undone, so it asks once more before going ahead.
export function DeleteSimulation({ id, name }: { id: string; name: string }) {
  const [confirming, setConfirming] = useState(false);
  const [failed, setFailed] = useState(false);
  const [pending, startTransition] = useTransition();
  const button = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

  const remove = () =>
    startTransition(async () => {
      const deleted = await deleteSimulation(id).catch(() => false);
      if (!deleted) {
        setFailed(true);
        return;
      }
      const status = document.getElementById(LIST_STATUS_ID);
      if (status) status.textContent = `«${name}» eliminada.`;
      document.getElementById(LIST_HEADING_ID)?.focus();
    });

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${button} text-error`}>
        Eliminar<span className="sr-only"> «{name}»</span>
      </button>
    );
  }
  return (
    <div className="settle flex flex-col gap-1">
      <div role="group" aria-label={`Confirmar eliminación de «${name}»`} className="flex flex-wrap items-center gap-x-4">
        <span className="text-caption">¿Eliminar? No se puede deshacer.</span>
        <button type="button" disabled={pending} onClick={remove} className={`${button} text-error disabled:text-ink-muted-48`}>
          {pending ? "Eliminando…" : "Sí, eliminar"}
        </button>
        <button
          type="button"
          autoFocus
          disabled={pending}
          onClick={() => {
            setConfirming(false);
            setFailed(false);
          }}
          className={button}
        >
          Cancelar
        </button>
      </div>
      <p role="status" className="sr-only">
        {pending && "Eliminando…"}
      </p>
      {failed && (
        <p role="alert" className="text-caption text-error">
          No se pudo eliminar. Comprueba tu conexión e inténtalo de nuevo.
        </p>
      )}
    </div>
  );
}
