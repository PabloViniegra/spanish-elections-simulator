"use client";

import { useState } from "react";
import type { CatalogParty } from "@/lib/builder/types";
import { BuilderImportContainer } from "./builder-import-container";
import { BuilderSetupContainer } from "./builder-setup-container";
import { RadioCards } from "./radio-cards";

type Mode = "typed" | "imported";

const modes: { value: Mode; label: string; hint: string }[] = [
  { value: "typed", label: "Elegir partidos y escribir los votos", hint: "Provincia a provincia, con lo guardado a cada paso." },
  { value: "imported", label: "Importar los votos desde un CSV", hint: "Las 52 provincias de una vez; los partidos salen de la cabecera del archivo." },
];

// How the new election gets its votes.
export function BuilderStart({ catalog }: { catalog: readonly CatalogParty[] }) {
  const [mode, setMode] = useState<Mode>("typed");
  return (
    <div className="flex flex-col gap-12">
      <RadioCards
        legend="Cómo quieres empezar"
        name="mode"
        options={modes}
        value={mode}
        onChange={setMode}
        className="grid grid-cols-[minmax(0,1fr)] gap-3 sm:grid-cols-2"
      />
      {mode === "typed" ? <BuilderSetupContainer catalog={catalog} /> : <BuilderImportContainer catalog={catalog} />}
    </div>
  );
}
