"use client";

import { useActionState, useState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { createBuilt } from "@/lib/builder/actions";
import { allocateBuilt } from "@/lib/builder/allocate";
import { importNewCsv, newCsvTemplate, type NewImportResult } from "@/lib/builder/import";
import { builderReference as reference, censusElection, seatTables } from "@/lib/builder/reference";
import { nationalTotals } from "@/lib/builder/results";
import type { BuiltScenario, CatalogParty, SeatTable } from "@/lib/builder/types";
import { BuilderImportForm } from "./builder-import-form";
import { downloadCsv, readCsvFile, type CsvFile } from "./csv-file";

const year = censusElection.slice(0, 4);
// The template starts with the parties that ran last time, most voted first.
const TEMPLATE_PARTIES = 10;

// A new election whose parties and votes all come from one file.
export function BuilderImportContainer({ catalog }: { catalog: readonly CatalogParty[] }) {
  const [state, action, pending] = useActionState(createBuilt, undefined);
  const ref = useFocusOnError(state);
  const [name, setName] = useState("");
  const [seatTable, setSeatTable] = useState<SeatTable>("2026");
  const [chosen, setChosen] = useState<CsvFile | null>(null);
  const [inputKey, setInputKey] = useState(0);

  const result: NewImportResult | null = !chosen
    ? null
    : "refused" in chosen
      ? { ok: false, issues: [{ message: chosen.refused }] }
      : importNewCsv(chosen.text, catalog, reference, year);
  const scenario: BuiltScenario | null = result?.ok ? { schemaVersion: 1, seatTable, parties: result.parties, provinces: result.provinces } : null;
  const results = scenario && allocateBuilt(scenario, seatTables[seatTable], reference);

  const choose = async (file: File | undefined) => {
    if (file) setChosen(await readCsvFile(file));
  };
  const template = () =>
    downloadCsv(newCsvTemplate(catalog.filter((party) => party.lastElection === censusElection).slice(0, TEMPLATE_PARTIES)), "plantilla-elecciones.csv");

  return (
    <div ref={ref}>
      <BuilderImportForm
        state={state}
        action={action}
        pending={pending}
        censusYear={year}
        name={name}
        seatTable={seatTable}
        onName={setName}
        onSeatTable={setSeatTable}
        picker={{ inputKey, fileName: chosen?.name ?? null, onTemplate: template, onChoose: (file) => void choose(file) }}
        issues={result && !result.ok ? result.issues : null}
        scenario={scenario}
        preview={scenario && results ? nationalTotals(scenario, results) : null}
        onCancel={() => {
          setChosen(null);
          setInputKey((key) => key + 1);
        }}
      />
    </div>
  );
}
