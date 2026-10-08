"use client";

import { type ReactNode, useEffect, useId, useRef, useState } from "react";

type Panel = "downloads" | "save";

type ResultsActionsProps = {
  share: ReactNode;
  downloads: ReactNode;
  // Signed out there is nothing to save to.
  save?: ReactNode;
};

const toggleClass =
  "inline-flex min-h-11 items-center gap-2 rounded-full border border-hairline px-5 text-caption font-semibold transition-[background-color,scale] duration-150 hover:bg-canvas-parchment aria-expanded:border-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus active:scale-[0.96] motion-reduce:transition-none";

// The link stays in view; downloads and saving open on demand so the results
// lead the column. Kept outside the keyed save form so an edit leaves it open.
export function ResultsActions({ share, downloads, save }: ResultsActionsProps) {
  const [open, setOpen] = useState<Panel | null>(null);
  const panelId = useId();
  const panel = useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (open === "save") panel.current?.querySelector<HTMLInputElement>("input:not([type=hidden])")?.focus();
  }, [open]);
  const toggle = (label: string, value: Panel) => (
    <button type="button" aria-expanded={open === value} aria-controls={open === value ? panelId : undefined} onClick={() => setOpen(open === value ? null : value)} className={toggleClass}>
      {label}
      <svg viewBox="0 0 12 8" aria-hidden="true" className={`h-2 w-3 fill-none stroke-current stroke-2 transition-transform duration-150 motion-reduce:transition-none ${open === value ? "rotate-180" : ""}`}>
        <path d="M1 1.5 6 6.5 11 1.5" />
      </svg>
    </button>
  );
  return (
    <div className="flex flex-col gap-3">
      <div role="group" aria-label="Compartir, descargar y guardar" className="flex flex-wrap items-center gap-x-3 gap-y-2">
        {share}
        {toggle("Descargar", "downloads")}
        {save && toggle("Guardar", "save")}
      </div>
      {open && (
        <div ref={panel} id={panelId} className={`settle rounded-lg border border-hairline p-4 ${open === "downloads" ? "flex flex-wrap items-center gap-x-3 gap-y-2" : ""}`}>
          {open === "downloads" ? downloads : save}
        </div>
      )}
    </div>
  );
}
