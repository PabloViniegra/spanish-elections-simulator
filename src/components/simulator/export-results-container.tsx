"use client";

import { useState } from "react";
import { notify } from "@/components/feedback/notify";
import type { Bloc } from "@/lib/elections/types";
import type { ConstituencyResult } from "@/lib/engine/types";
import { resultsCsv } from "@/lib/scenario/export-csv";
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

const loadHemicyclePng = () => import("@/lib/scenario/export-png").then((module) => module.hemicyclePng);

type ExportResultsContainerProps = {
  results: readonly ConstituencyResult[];
  blocs: readonly Bloc[];
  ranked: readonly (Bloc & { seats: number })[];
  filename: string;
  subtitle: string;
  link: () => string | Promise<string>;
  stale: boolean;
};

export function ExportResultsContainer({ results, blocs, ranked, filename, subtitle, link, stale }: ExportResultsContainerProps) {
  const [busy, setBusy] = useState(false);
  const csv = () => {
    if (stale || busy) return;
    try {
      download(new Blob([resultsCsv(results, blocs)], { type: "text/csv;charset=utf-8" }), `simulacion-${filename}.csv`);
      notify.success({ title: "CSV descargado", description: "Resultados por provincia y partido." });
    } catch {
      notify.error({ title: "No se ha podido descargar el CSV", description: "Vuelve a intentarlo." });
    }
  };
  const png = () => {
    if (stale || busy) return;
    setBusy(true);
    notify
      .promise(
        Promise.all([loadHemicyclePng(), link()]).then(([hemicyclePng, href]) => hemicyclePng(ranked, subtitle, href)).then((blob) => download(blob, `hemiciclo-${filename}.png`)),
        {
          loading: { title: "Preparando PNG…" },
          success: { title: "PNG descargado", description: "El hemiciclo con el enlace a esta simulación." },
          error: { title: "No se ha podido descargar el PNG", description: "Vuelve a intentarlo." },
        },
      )
      .catch(() => {})
      .finally(() => setBusy(false));
  };
  return <ExportResults stale={stale} busy={busy} onCsv={csv} onPng={png} />;
}
