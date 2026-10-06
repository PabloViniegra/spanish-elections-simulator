"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { minimalWinningCoalitions } from "@/lib/scenario/coalitions";
import { rebalance } from "@/lib/scenario/rebalance";
import { baseScenario, fitsInFull, othersShare, provinceShares, simulate } from "@/lib/scenario/simulate";
import type { ProvinceShares, Scenario } from "@/lib/scenario/types";
import { decodeScenario, encodeScenario, SCENARIO_PARAM } from "@/lib/scenario/url";
import { provinces } from "@/lib/provinces";
import { seats2026 } from "@/lib/seats-2026";
import { CoalitionCalculator } from "./coalition-calculator";
import { HowSeatsWork } from "./how-seats-work";
import { type InputMode, ModeSwitch } from "./mode-switch";
import { NationalInputs } from "./national-inputs";
import { ProvinceInputs } from "./province-inputs";
import { ResultsHemicycle } from "./results-hemicycle";
import { ResultsStrip } from "./results-strip";
import { ShareLink } from "./share-link";

const baseline = baseScenario(election2023, blocs2023);
const baselineOthers = othersShare(baseline);
const baselineSimulation = simulate(baseline, election2023, blocs2023, seats2026);
const provinceCodes = new Set(provinces.map(({ code }) => code));

// Seats per bloc in one province of a simulation.
function provinceSeats(results: typeof baselineSimulation.results, code: string) {
  const result = results.find((constituency) => constituency.code === code);
  return new Map(result?.candidacies.map(({ id, seats }) => [id, seats]));
}

// National (FR-02) and provincial (FR-03) modes over one scenario: 2023 votes
// as the base, 2026 seats. Results follow the last scenario whose shares fit
// in 100%, which the address mirrors.
export function SimulatorContainer() {
  const shared = useSearchParams().get(SCENARIO_PARAM);
  // Read once: the address changes with every edit afterwards.
  const [restored] = useState(() => (shared ? decodeScenario(shared, baseline, provinceCodes) : null));
  const [brokenLink] = useState(Boolean(shared) && !restored);
  const [scenario, setScenario] = useState(restored ?? baseline);
  const [valid, setValid] = useState(restored ?? baseline);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [mode, setMode] = useState<InputMode>("national");
  const [code, setCode] = useState("28");

  const update = (next: Scenario) => {
    setScenario(next);
    if (fitsInFull(next)) setValid(next);
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

  const stale = !fitsInFull(scenario);
  const simulation = simulate(valid, election2023, blocs2023, seats2026);
  const lockedCodes = provinces.map((province) => province.code).filter((locked) => scenario.provinces?.[locked]);
  // Locking a province starts from its projection, so nothing moves until the
  // user changes a share.
  const projected = provinceShares(simulation.provinces.get(code)!, blocs2023);
  const province = scenario.provinces?.[code] ?? projected;
  // Regional blocs only appear where they ran in 2023 (P-05) or the user gave
  // them votes.
  const provinceBlocs = blocs2023.filter(
    (bloc) => (baselineSimulation.provinces.get(code)?.get(bloc.id) ?? 0) > 0 || (province.shares[bloc.id] ?? 0) > 0,
  );
  const editProvince = (next: ProvinceShares) => update({ ...scenario, provinces: { ...scenario.provinces, [code]: next } });
  const unlockProvince = () => {
    const rest = Object.entries(scenario.provinces ?? {}).filter(([locked]) => locked !== code);
    update({ ...scenario, provinces: rest.length > 0 ? Object.fromEntries(rest) : undefined });
  };
  const ranked = blocs2023
    .map((bloc) => ({ ...bloc, seats: simulation.seats.get(bloc.id) ?? 0 }))
    .filter((bloc) => bloc.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  return (
    <>
      <ResultsStrip ranked={ranked} stale={stale} />
      <div className="mx-auto grid max-w-content gap-10 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-16">
        <div className="flex flex-col gap-6">
          <ModeSwitch mode={mode} onChange={setMode} />
          {mode === "national" ? (
            <NationalInputs
              blocs={blocs2023}
              shares={scenario.shares}
              blank={scenario.blank}
              others={othersShare(scenario)}
              seats={simulation.seats}
              baseSeats={baselineSimulation.seats}
              offTarget={simulation.offTarget}
              lockedCount={lockedCodes.length}
              stale={stale}
              onShareChange={(blocId, value) => update({ ...scenario, shares: { ...scenario.shares, [blocId]: value } })}
              onBlankChange={(blank) => update({ ...scenario, blank })}
              onRebalance={() => update(rebalance(scenario, baselineOthers))}
              onReset={() => update(baseline)}
            />
          ) : (
            <ProvinceInputs
              blocs={blocs2023}
              rowBlocs={provinceBlocs}
              provinces={provinces}
              code={code}
              deputies={seats2026.get(code) ?? 0}
              lockedCodes={lockedCodes}
              shares={province.shares}
              blank={province.blank}
              others={othersShare(province)}
              seats={provinceSeats(simulation.results, code)}
              baseSeats={provinceSeats(baselineSimulation.results, code)}
              offTarget={simulation.offTarget}
              stale={stale}
              onSelect={setCode}
              onShareChange={(blocId, value) => editProvince({ ...province, shares: { ...province.shares, [blocId]: value } })}
              onBlankChange={(blank) => editProvince({ ...province, blank })}
              onRebalance={() => editProvince(rebalance(province, othersShare(projected)))}
              onUnlock={unlockProvince}
              onReset={() => update(baseline)}
            />
          )}
          <HowSeatsWork />
        </div>
        <div className="flex flex-col gap-6 lg:sticky lg:top-6">
          <ShareLink brokenLink={brokenLink} />
          <ResultsHemicycle ranked={ranked} stale={stale} selected={selected} />
          <div className={`transition-opacity ${stale ? "opacity-40" : ""}`}>
            <CoalitionCalculator
              ranked={ranked}
              selected={selected}
              onToggle={toggle}
              coalitions={minimalWinningCoalitions(simulation.seats)}
            />
          </div>
        </div>
      </div>
    </>
  );
}
