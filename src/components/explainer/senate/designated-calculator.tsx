"use client";

import { useState } from "react";
import { designatedFor } from "@/lib/senate/senate";

const STEP = 50_000;
const millions = (n: number) => `${(n / 1_000_000).toLocaleString("es-ES", { maximumFractionDigits: 2 })} millones`;

export function DesignatedCalculator() {
  const [population, setPopulation] = useState(2_400_000);
  const seats = designatedFor(population);

  return (
    <div className="flex flex-col gap-5 rounded-lg bg-canvas-parchment p-5 sm:p-7">
      <label className="flex flex-col gap-3">
        <span className="text-caption text-ink-muted-80">Habitantes de una comunidad imaginaria</span>
        <span className="text-tagline font-semibold tabular-nums">{millions(population)}</span>
        <input
          type="range"
          min={STEP}
          max={9_000_000}
          step={STEP}
          value={population}
          onChange={(event) => setPopulation(Number(event.target.value))}
          aria-valuetext={millions(population)}
          className="min-h-11 w-full accent-ink focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary-focus"
        />
      </label>
      <p aria-live="polite" className="flex flex-wrap items-center gap-3 text-body">
        <span aria-hidden="true" className="flex flex-wrap gap-1.5">
          {Array.from({ length: seats }, (_, i) => (
            <span key={i} className={`size-4 rounded-full transition-[opacity,scale] duration-200 ease-snappy starting:opacity-0 motion-safe:starting:scale-90 ${i === 0 ? "bg-ink" : "border-2 border-ink"}`} />
          ))}
        </span>
        <span>
          <span className="font-semibold tabular-nums">
            {seats} {seats === 1 ? "senador" : "senadores"}
          </span>
          <span className="text-ink-muted-80">
            {" "}
            {seats === 1 ? "fijo: no llega al millón" : `= 1 fijo + ${seats - 1} por ${seats === 2 ? "el millón completo" : "los millones completos"}`}
          </span>
        </span>
      </p>
    </div>
  );
}
