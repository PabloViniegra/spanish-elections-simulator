"use client";

import { useState } from "react";
import type { Bloc } from "@/lib/elections/types";
import type { ConstituencyResult } from "@/lib/engine/types";
import type { Scenario } from "@/lib/scenario/types";
import { exportScenarioId } from "@/lib/scenario/export-file-name";
import { resultsCsv } from "@/lib/scenario/export-csv";
import { encodeScenario, SCENARIO_PARAM } from "@/lib/scenario/url";
import { hemicyclePng } from "@/lib/scenario/export-png";
import { ExportResults } from "./export-results";

function download(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.append(link);
  link.click();
  link.remove();
  // The browser may not have started reading the download when click returns.
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

type ExportResultsContainerProps = {
  results: readonly ConstituencyResult[];
  blocs: readonly Bloc[];
  ranked: readonly (Bloc & { seats: number })[];
  scenario: Scenario;
  baseId: string;
  baseLabel: string;
  stale: boolean;
};

export function ExportResultsContainer({ results, blocs, ranked, scenario, baseId, baseLabel, stale }: ExportResultsContainerProps) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const filename = `${baseId}-${exportScenarioId(scenario)}`;
  const csv = () => {
    if (stale || busy) return;
    try {
      download(new Blob([resultsCsv(results, blocs)], { type: "text/csv;charset=utf-8" }), `simulacion-${filename}.csv`);
      setMessage("Descarga del CSV iniciada.");
    } catch {
      setMessage("No se ha podido descargar el CSV. Vuelve a intentarlo.");
    }
  };
  const png = async () => {
    if (stale || busy) return;
    setBusy(true);
    setMessage("");
    try {
      const url = new URL(window.location.href);
      url.searchParams.set(SCENARIO_PARAM, encodeScenario(scenario));
      download(await hemicyclePng(ranked, baseLabel, url.href), `hemiciclo-${filename}.png`);
      setMessage("Descarga del PNG iniciada.");
    } catch {
      setMessage("No se ha podido descargar el PNG. Vuelve a intentarlo.");
    } finally {
      setBusy(false);
    }
  };
  return <ExportResults stale={stale} busy={busy} message={message} onCsv={csv} onPng={png} />;
}
