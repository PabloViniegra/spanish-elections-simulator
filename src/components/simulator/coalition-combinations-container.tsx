"use client";

import { useState } from "react";
import type { Bloc } from "@/lib/elections/types";
import { MAJORITY } from "@/lib/hemicycle-layout";
import { minimalWinningCoalitions } from "@/lib/scenario/coalitions";
import { CoalitionCombinations } from "./coalition-combinations";

const PAGE_SIZE = 50;
type Ranked = readonly (Bloc & { seats: number })[];

function CoalitionPages({ coalitions, ranked }: { coalitions: ReturnType<typeof minimalWinningCoalitions>; ranked: Ranked }) {
  const [page, setPage] = useState(0);
  const pages = Math.max(1, Math.ceil(coalitions.length / PAGE_SIZE));
  return <CoalitionCombinations rows={coalitions.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)} names={new Map(ranked.map(({ id, name }) => [id, name]))} page={page} pages={pages} total={coalitions.length} onPage={setPage} />;
}

export function CoalitionCombinationsContainer({ ranked }: { ranked: Ranked }) {
  const [open, setOpen] = useState(false);
  const coalitions = open ? minimalWinningCoalitions(new Map(ranked.map(({ id, seats }) => [id, seats]))) : [];
  const signature = ranked.map(({ id, seats }) => `${id}:${seats}`).join();
  return (
    <details className="text-caption" onToggle={(event) => setOpen(event.currentTarget.open)}>
      <summary className="min-h-11 cursor-pointer py-3">Combinaciones mínimas que llegan a {MAJORITY}{open ? ` (${coalitions.length})` : ""}</summary>
      {open ? <CoalitionPages key={signature} coalitions={coalitions} ranked={ranked} /> : null}
    </details>
  );
}
