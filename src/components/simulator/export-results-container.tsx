"use client";

import { useState } from "react";
import { notify } from "@/components/feedback/notify";
import type { Bloc } from "@/lib/elections/types";
import type { ConstituencyResult } from "@/lib/engine/types";
import type { Scenario } from "@/lib/scenario/types";
import { exportScenarioId } from "@/lib/scenario/export-file-name";
import { resultsCsv } from "@/lib/scenario/export-csv";
import { encodeScenario, SCENARIO_PARAM } from "@/lib/scenario/address";
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
  const filename = `${baseId}-${exportScenarioId(scenario)}`;
  const csv = () => {
    if (stale || busy) return;
    try {
      download(new Blob([resultsCsv(results, blocs)], { type: "text/csv;charset=utf-8" }), `simulacion-${filename}.csv`);
      notify.success({ title: "CSV descargado", description: "Resultados por provincia y partido." });
    } catch {
      notify.error({ title: "No se ha podido descargar el CSV", description: "Vuelve a intentarlo." });
    }
  };
  const png = async () => {
    if (stale || busy) return;
    setBusy(true);
    const url = new URL(window.location.href);
    url.searchParams.set(SCENARIO_PARAM, encodeScenario(scenario));
    try {
      await notify.promise(
        import("@/lib/scenario/export-png").then(({ hemicyclePng }) => hemicyclePng(ranked, baseLabel, url.href)).then((blob) => download(blob, `hemiciclo-${filename}.png`)),
        {
          loading: { title: "Preparando PNG…" },
          success: { title: "PNG descargado", description: "El hemiciclo con el enlace a esta simulación." },
          error: { title: "No se ha podido descargar el PNG", description: "Vuelve a intentarlo." },
        },
      );
    } catch {
      // The toast already says so; the buttons come back for a retry.
    } finally {
      setBusy(false);
    }
  };
  return <ExportResults stale={stale} busy={busy} onCsv={csv} onPng={png} />;
}
