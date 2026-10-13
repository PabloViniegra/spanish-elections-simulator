"use client";

import { useEffect, useState, useSyncExternalStore } from "react";
import { Notice } from "@/components/feedback/notice";
import type { Bloc } from "@/lib/elections/types";
import { MAJORITY } from "@/lib/hemicycle-layout";
import type { CoalitionPage, CoalitionRequest } from "@/lib/scenario/coalition-page";
import { CoalitionCombinations } from "./coalition-combinations";

const PAGE_SIZE = 50;
const MOBILE_PAGE_SIZE = 12;
const MOBILE_QUERY = "(max-width: 639px)";
const subscribeSize = (notify: () => void) => {
  const query = window.matchMedia(MOBILE_QUERY);
  query.addEventListener("change", notify);
  return () => query.removeEventListener("change", notify);
};
const mobileSize = () => window.matchMedia(MOBILE_QUERY).matches;
const serverSize = () => false;
type Ranked = readonly (Bloc & { seats: number })[];

function CoalitionPageResults({ ranked, page, size, onPage }: { ranked: Ranked; page: number; size: number; onPage: (page: number) => void }) {
  const [result, setResult] = useState<(CoalitionPage & { page: number }) | null>(null);
  const [failed, setFailed] = useState(false);
  const [attempt, setAttempt] = useState(0);
  useEffect(() => {
    const worker = new Worker(new URL("../../lib/scenario/coalitions.worker.ts", import.meta.url));
    worker.onmessage = (event: MessageEvent<CoalitionPage>) => setResult({ ...event.data, page });
    worker.onerror = () => setFailed(true);
    const request: CoalitionRequest = { seats: ranked.map(({ id, seats }) => [id, seats]), page, size };
    worker.postMessage(request);
    return () => worker.terminate();
  }, [ranked, page, size, attempt]);

  if (failed) {
    return (
      <Notice tone="error" role="alert">
        No se han podido calcular las combinaciones.{" "}
        <button type="button" className="-my-3 min-h-11 font-semibold underline underline-offset-2" onClick={() => { setFailed(false); setAttempt(attempt + 1); }}>
          Reintentar
        </button>
      </Notice>
    );
  }
  if (!result) return <p role="status">Calculando combinaciones…</p>;
  return <CoalitionCombinations rows={result.rows} names={new Map(ranked.map(({ id, name }) => [id, name]))} page={result.page} pages={Math.max(1, Math.ceil(result.total / size))} total={result.total} busy={result.page !== page} onPage={onPage} />;
}

function CoalitionPages({ ranked, size }: { ranked: Ranked; size: number }) {
  const [page, setPage] = useState(0);
  return <CoalitionPageResults ranked={ranked} page={page} size={size} onPage={setPage} />;
}

export function CoalitionCombinationsContainer({ ranked }: { ranked: Ranked }) {
  const [open, setOpen] = useState(false);
  const mobile = useSyncExternalStore(subscribeSize, mobileSize, serverSize);
  const size = mobile ? MOBILE_PAGE_SIZE : PAGE_SIZE;
  const signature = ranked.map(({ id, name, seats }) => `${id}:${name}:${seats}`).join();
  return (
    <details className="text-caption" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="min-h-11 cursor-pointer py-3">Combinaciones mínimas que llegan a {MAJORITY}</summary>
      {open ? <CoalitionPages key={`${signature}:${size}`} ranked={ranked} size={size} /> : null}
    </details>
  );
}
