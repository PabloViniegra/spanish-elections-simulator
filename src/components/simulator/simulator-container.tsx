"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { minimalWinningCoalitions } from "@/lib/scenario/coalitions";
import { baseScenario, othersShare, simulate } from "@/lib/scenario/simulate";
import type { Scenario } from "@/lib/scenario/types";
import { decodeScenario, encodeScenario, SCENARIO_PARAM } from "@/lib/scenario/url";
import { seats2026 } from "@/lib/seats-2026";
import { CoalitionCalculator } from "./coalition-calculator";
import { NationalInputs } from "./national-inputs";
import { ResultsHemicycle } from "./results-hemicycle";
import { ShareLink } from "./share-link";

const baseline = baseScenario(election2023, blocs2023);
const baselineSeats = simulate(baseline, election2023, blocs2023, seats2026).seats;

// National mode (FR-02): 2023 votes as the base, 2026 seats. Results follow
// the last scenario whose shares fit in 100%, which the address mirrors.
export function SimulatorContainer() {
  const shared = useSearchParams().get(SCENARIO_PARAM);
  // Read once: the address changes with every edit afterwards.
  const [restored] = useState(() => (shared ? decodeScenario(shared, baseline) : null));
  const [brokenLink] = useState(Boolean(shared) && !restored);
  const [scenario, setScenario] = useState(restored ?? baseline);
  const [valid, setValid] = useState(restored ?? baseline);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());

  const update = (next: Scenario) => {
    setScenario(next);
    if (othersShare(next) >= 0) setValid(next);
  };
  useEffect(() => {
    const url = new URL(window.location.href);
    if (valid === baseline) url.searchParams.delete(SCENARIO_PARAM);
    else url.searchParams.set(SCENARIO_PARAM, encodeScenario(valid));
    window.history.replaceState(null, "", url);
  }, [valid]);
  const toggle = (blocId: string) => {
    const next = new Set(selected);
    if (!next.delete(blocId)) next.add(blocId);
    setSelected(next);
  };

  const simulation = simulate(valid, election2023, blocs2023, seats2026);
  const ranked = blocs2023
    .map((bloc) => ({ ...bloc, seats: simulation.seats.get(bloc.id) ?? 0 }))
    .filter((bloc) => bloc.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  return (
    <div className="mx-auto grid max-w-content gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-16">
      <div className="flex flex-col gap-6 lg:sticky lg:top-6 lg:order-2">
        <ShareLink brokenLink={brokenLink} />
        <ResultsHemicycle ranked={ranked} />
        <CoalitionCalculator
          ranked={ranked}
          selected={selected}
          onToggle={toggle}
          coalitions={minimalWinningCoalitions(simulation.seats)}
        />
      </div>
      <div className="lg:order-1">
        <NationalInputs
          blocs={blocs2023}
          shares={scenario.shares}
          blank={scenario.blank}
          others={othersShare(scenario)}
          seats={simulation.seats}
          baseSeats={baselineSeats}
          offTarget={simulation.offTarget}
          onShareChange={(blocId, value) => update({ ...scenario, shares: { ...scenario.shares, [blocId]: value } })}
          onBlankChange={(blank) => update({ ...scenario, blank })}
          onReset={() => update(baseline)}
        />
      </div>
    </div>
  );
}
