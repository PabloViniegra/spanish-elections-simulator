"use client";

import { useEffect, useState } from "react";
import { notify } from "@/components/feedback/notify";
import { allocateBuilt } from "@/lib/builder/allocate";
import { clashingNames, csvTemplate, importCsv, type ImportResult } from "@/lib/builder/import";
import { builderReference as reference, censusElection, seatTables } from "@/lib/builder/reference";
import { nationalTotals } from "@/lib/builder/results";
import type { BuiltProvince, BuiltScenario } from "@/lib/builder/types";
import { CsvImport } from "./csv-import";
import { downloadCsv, readCsvFile, type CsvFile } from "./csv-file";

type CsvImportContainerProps = {
  scenario: BuiltScenario;
  onImport: (provinces: Record<string, BuiltProvince>) => void;
  // Stores the scenario as it is now; false when it could not.
  onSave: () => Promise<boolean>;
};

type ImportStage = "saving" | "done" | "error";

const year = censusElection.slice(0, 4);
const STEPS = ["Archivo comprobado", "Votos de las 52 provincias reemplazados", "Guardado en tu perfil"] as const;

export function CsvImportContainer({ scenario, onImport, onSave }: CsvImportContainerProps) {
  const [chosen, setChosen] = useState<CsvFile | null>(null);
  // A new object for each attempt, so a retry saves again.
  const [stage, setStage] = useState<{ kind: ImportStage } | null>(null);
  const [inputKey, setInputKey] = useState(0);
  const reset = () => {
    setChosen(null);
    setInputKey((key) => key + 1);
  };

  // Runs after the render that holds the imported votes, so the save sends them.
  useEffect(() => {
    if (stage?.kind !== "saving") return;
    let current = true;
    void onSave().then((saved) => {
      if (!current) return;
      setStage({ kind: saved ? "done" : "error" });
      if (saved) notify.success({ title: "Votos importados", description: "Las 52 provincias tienen los votos del archivo y están guardadas." });
    });
    return () => {
      current = false;
    };
  }, [stage, onSave]);

  const choose = async (file: File | undefined) => {
    if (!file) return;
    setStage(null);
    setChosen(await readCsvFile(file));
  };

  const result: ImportResult | null = !chosen
    ? null
    : "refused" in chosen
      ? { ok: false, issues: [{ message: chosen.refused }] }
      : importCsv(chosen.text, scenario, reference, year);
  const imported = result?.ok ? { ...scenario, provinces: result.provinces } : null;
  const results = imported && allocateBuilt(imported, seatTables[imported.seatTable], reference);

  const confirm = () => {
    if (!result?.ok) return;
    onImport(result.provinces);
    reset();
    setStage({ kind: "saving" });
  };

  return (
    <CsvImport
      censusYear={year}
      clashes={clashingNames(scenario.parties)}
      picker={{
        inputKey,
        fileName: chosen?.name ?? null,
        onTemplate: () => downloadCsv(csvTemplate(scenario), "plantilla-votos.csv"),
        onChoose: (file) => void choose(file),
      }}
      issues={result && !result.ok ? result.issues : null}
      preview={
        imported && results
          ? { ...nationalTotals(imported, results), replaced: Object.keys(scenario.provinces).length, onConfirm: confirm, onCancel: reset }
          : null
      }
      progress={
        stage &&
        (stage.kind === "saving"
          ? { steps: STEPS, done: 2, label: "Guardando en tu perfil…" }
          : stage.kind === "done"
            ? { steps: STEPS, done: 3, label: "Importación completa" }
            : { steps: STEPS, done: 2, label: "No se han podido guardar los votos importados.", onRetry: () => setStage({ kind: "saving" }) })
      }
    />
  );
}
