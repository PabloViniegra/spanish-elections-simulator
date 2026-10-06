"use client";

import { useState } from "react";

// FR-10: copies the current address, which always holds the scenario.
export function ShareLink({ brokenLink }: { brokenLink: boolean }) {
  const [message, setMessage] = useState("");
  const copy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("Enlace copiado.");
    } catch {
      setMessage("No se ha podido copiar. Copia la dirección del navegador.");
    }
  };
  return (
    <div className="flex flex-col gap-2">
      {brokenLink && (
        <p role="status" className="rounded-sm border border-error p-3 text-caption">
          El enlace no es válido o es de otra versión. Se muestran los resultados de 2023.
        </p>
      )}
      <div className="flex flex-wrap items-center gap-3">
        <button
          type="button"
          onClick={copy}
          className="min-h-11 rounded-full border border-primary px-5 text-caption text-primary transition-[background-color,scale] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] hover:bg-primary/8 active:scale-[0.97]"
        >
          Copiar enlace a este escenario
        </button>
        <p aria-live="polite" className="text-caption text-ink-muted-80">
          {message}
        </p>
      </div>
    </div>
  );
}
