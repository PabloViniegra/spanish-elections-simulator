"use client";

import { useState } from "react";
import { DHONDT_ID } from "@/components/simulator/ids";
import { allocateBuilt, partyBlocs } from "@/lib/builder/allocate";
import { builderReference as reference, seatTables } from "@/lib/builder/reference";
import { nationalTotals, seatTotals } from "@/lib/builder/results";
import type { BuiltScenario } from "@/lib/builder/types";
import { dhondtDetail } from "@/lib/engine/last-seat";
import { rankedBlocs } from "@/lib/scenario/blocs";
import { BuiltResults } from "./built-results";

type BuiltResultsContainerProps = {
  scenario: BuiltScenario;
  // Absent in a shared link, which only carries the votes.
  name?: string;
  // The owner's own copy, which can be edited and shared.
  ownerId?: string;
};

// The Congreso of a complete built election, with the same views as the simulator.
export function BuiltResultsContainer({ scenario, name, ownerId }: BuiltResultsContainerProps) {
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [code, setCode] = useState("28");
  const results = allocateBuilt(scenario, seatTables[scenario.seatTable], reference) ?? [];
  const blocs = partyBlocs(scenario);
  const ranked = rankedBlocs(blocs, seatTotals(results));
  const totals = nationalTotals(scenario, results);
  const result = results.find((each) => each.code === code);
  const toggle = (id: string) => {
    const next = new Set(selected);
    if (!next.delete(id)) next.add(id);
    setSelected(next);
  };
  // The detail sits below the map, off-screen on a phone: bring it there.
  const showDetail = (next: string) => {
    setCode(next);
    const panel = document.getElementById(DHONDT_ID);
    panel?.scrollIntoView();
    panel?.querySelector("select")?.focus({ preventScroll: true });
  };
  // Only complete elections get here, so every province has its result.
  if (!result) return null;

  return (
    <BuiltResults
      name={name ?? "Elecciones construidas"}
      seatTable={scenario.seatTable}
      ownerId={ownerId}
      ranked={ranked}
      selected={selected}
      onToggle={toggle}
      table={{
        ...totals,
        rows: totals.rows.map((row) => ({ ...row, fullName: row.catalogId ? reference.catalog.get(row.catalogId)?.name : undefined })),
      }}
      blocs={blocs}
      results={results}
      detail={{ code, deputies: result.seats, detail: dhondtDetail(result), onSelect: setCode }}
      onDetail={showDetail}
    />
  );
}
