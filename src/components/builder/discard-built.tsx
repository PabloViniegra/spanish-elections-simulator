"use client";

import { useState } from "react";

// Discarding deletes the election, so it asks once more before going ahead.
export function DiscardBuilt({ pending, onDiscard }: { pending: boolean; onDiscard: () => void }) {
  const [confirming, setConfirming] = useState(false);
  const button = "flex min-h-11 items-center text-caption font-semibold underline underline-offset-2";

  if (!confirming) {
    return (
      <button type="button" onClick={() => setConfirming(true)} className={`${button} w-fit text-error`}>
        Descartar estas elecciones
      </button>
    );
  }
  return (
    <div className="settle flex flex-col gap-1">
      <div role="group" aria-label="Confirmar que descartas estas elecciones" className="flex flex-wrap items-center gap-x-4">
        <span className="text-caption">¿Descartarlas? Se borrarán de tu perfil y no se puede deshacer.</span>
        <button type="button" disabled={pending} onClick={onDiscard} className={`${button} text-error disabled:text-ink-muted-48`}>
          {pending ? "Descartando…" : "Sí, descartar"}
        </button>
        <button type="button" autoFocus disabled={pending} onClick={() => setConfirming(false)} className={button}>
          Cancelar
        </button>
      </div>
      <p role="status" className="sr-only">
        {pending && "Descartando…"}
      </p>
    </div>
  );
}
