"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { baseById, bases, defaultBase } from "@/lib/elections/bases";
import { dhondtDetail } from "@/lib/engine/last-seat";
import { baselineOf } from "@/lib/scenario/baselines";
import { minimalWinningCoalitions } from "@/lib/scenario/coalitions";
import { adjustBlank, adjustShare, rebalance } from "@/lib/scenario/rebalance";
import { fitsInFull, othersShare, provinceShares, simulate } from "@/lib/scenario/simulate";
import type { ProvinceShares, Scenario } from "@/lib/scenario/types";
import { restoreScenario } from "@/lib/scenario/restore";
import { encodeScenario, SCENARIO_PARAM, simulatorHref } from "@/lib/scenario/url";
import { provinces } from "@/lib/provinces";
import { seats2026 } from "@/lib/seats-2026";
import { BaseSelect } from "./base-select";
import { CoalitionCalculator } from "./coalition-calculator";
import { DHONDT_ID, DhondtDetail } from "./dhondt-detail";
import { HowSeatsWork } from "./how-seats-work";
import { type InputMode, ModeSwitch } from "./mode-switch";
import { NationalInputs } from "./national-inputs";
import { ProvinceInputs } from "./province-inputs";
import { ProvinceMapContainer } from "./province-map-container";
import { ReadOnlyNotice } from "./read-only-notice";
import { ResultsHemicycle } from "./results-hemicycle";
import { RESULTS_ID, ResultsStrip } from "./results-strip";
import { SaveSimulationContainer } from "./save-simulation-container";
import { ShareLink } from "./share-link";
import { UndoNotice } from "./undo-notice";
import { useScenario } from "./use-scenario";

const baseOptions = bases.map(({ election, label }) => ({ id: election.id, label }));
// Anchor field for the blank vote, apart from any bloc id.
const BLANK_FIELD = "blank";

type Results = ReturnType<typeof simulate>["results"];

// Seats per bloc in one province of a simulation.
function provinceSeats(results: Results, code: string) {
  const result = results.find((constituency) => constituency.code === code);
  return new Map(result?.candidacies.map(({ id, seats }) => [id, seats]));
}

// National (FR-02) and provincial (FR-03) modes over one scenario: the votes
// of a bundled election as the base (FR-01), 2026 seats. Results follow the
// last scenario whose shares fit in 100%, which the address mirrors. Signed
// out, a shared link shows its results without the inputs.
export function SimulatorContainer({ signedIn }: { signedIn: boolean }) {
  const shared = useSearchParams().get(SCENARIO_PARAM);
  // Read once: the address changes with every edit afterwards.
  const [restored] = useState(() => (shared ? restoreScenario(shared) : null));
  const [brokenLink] = useState(Boolean(shared) && !restored);
  const { scenario, valid, notice, update, discard, undo } = useScenario(restored ?? baselineOf(defaultBase).scenario);
  const base = baseById(valid.baseElectionId) ?? defaultBase;
  const { blocs } = base;
  const baseline = baselineOf(base);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [mode, setMode] = useState<InputMode>("national");
  const [code, setCode] = useState("28");
  const [free, setFree] = useState(false);
  // The field being edited and the shares when it started moving: automatic
  // adjustment scales from there, and squaring up by hand keeps that field.
  const [anchor, setAnchor] = useState<{ scope: string; field: string; base: ProvinceShares } | null>(null);

  const scope = mode === "national" ? mode : code;
  const edit = <T extends ProvinceShares>(current: T, field: string, apply: (base: T) => T, plain: T) => {
    // SAFETY: the scope pins the shape: national anchors hold the scenario,
    // provincial ones that province's shares, the same type as `current`.
    const base = anchor?.scope === scope && anchor.field === field ? (anchor.base as T) : current;
    setAnchor({ scope, field, base });
    return free ? plain : apply(base);
  };
  const keptField = anchor?.scope === scope && anchor.field !== BLANK_FIELD ? anchor.field : undefined;
  // FR-04: starting over throws edits away, so it can be undone.
  const restart = (next: Scenario, message: string) => {
    setAnchor(null);
    discard(next, message);
  };
  const reset = () => restart(baseline.scenario, `Escenario restablecido a los resultados de ${base.label}.`);
  const changeBase = (id: string) => {
    const next = baseById(id);
    if (next) restart(baselineOf(next).scenario, `Votos de partida: generales de ${next.label}.`);
  };
  useEffect(() => {
    const url = new URL(window.location.href);
    if (valid === baselineOf(defaultBase).scenario) url.searchParams.delete(SCENARIO_PARAM);
    else url.searchParams.set(SCENARIO_PARAM, encodeScenario(valid));
    window.history.replaceState(null, "", url);
  }, [valid]);

  const stale = !fitsInFull(scenario);
  const simulation = simulate(valid, base.election, blocs, seats2026);
  const lockedCodes = provinces.map((province) => province.code).filter((locked) => scenario.provinces?.[locked]);
  // Locking a province starts from its projection, so nothing moves until the
  // user changes a share.
  const projected = provinceShares(simulation.provinces.get(code)!, blocs);
  const province = scenario.provinces?.[code] ?? projected;
  // Regional blocs only appear where they ran in the base election (P-05) or
  // the user gave them votes.
  const provinceBlocs = blocs.filter(
    (bloc) => (baseline.simulation.provinces.get(code)?.get(bloc.id) ?? 0) > 0 || (province.shares[bloc.id] ?? 0) > 0,
  );
  const editProvince = (next: ProvinceShares) => update({ ...scenario, provinces: { ...scenario.provinces, [code]: next } });
  const unlockProvince = () => {
    const rest = Object.entries(scenario.provinces ?? {}).filter(([locked]) => locked !== code);
    const name = provinces.find((option) => option.code === code)?.name;
    restart({ ...scenario, provinces: rest.length > 0 ? Object.fromEntries(rest) : undefined }, `${name} vuelve a la proyección.`);
  };
  // The detail sits below the map, off-screen on a phone: bring it back.
  const showDetail = (next: string) => {
    setCode(next);
    const panel = document.getElementById(DHONDT_ID);
    panel?.scrollIntoView();
    panel?.querySelector("select")?.focus({ preventScroll: true });
  };
  const result = simulation.results.find((constituency) => constituency.code === code)!;
  // Coalition picks carry over between bases where the bloc still exists.
  const picked = new Set([...selected].filter((blocId) => blocs.some((bloc) => bloc.id === blocId)));
  const toggle = (blocId: string) => {
    const next = new Set(picked);
    if (!next.delete(blocId)) next.add(blocId);
    setSelected(next);
  };
  const ranked = blocs
    .map((bloc) => ({ ...bloc, seats: simulation.seats.get(bloc.id) ?? 0 }))
    .filter((bloc) => bloc.seats > 0)
    .sort((a, b) => b.seats - a.seats);

  return (
    <>
      <ResultsStrip ranked={ranked} stale={stale} selected={picked} />
      <div className="mx-auto grid max-w-content grid-cols-[minmax(0,1fr)] gap-10 [&>*]:min-w-0 px-5 py-10 sm:px-8 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-x-16 lg:gap-y-6">
        <div className="flex flex-col gap-6">
          {signedIn ? (
            <>
              <BaseSelect bases={baseOptions} value={base.election.id} onChange={changeBase} />
              <ModeSwitch mode={mode} onChange={setMode} />
              <UndoNotice notice={notice} onUndo={undo} />
              <div key={mode} className="settle">
                {mode === "national" ? (
                  <NationalInputs
                    blocs={blocs}
                    base={base}
                    shares={scenario.shares}
                    blank={scenario.blank}
                    others={othersShare(scenario)}
                    seats={simulation.seats}
                    baseSeats={baseline.simulation.seats}
                    offTarget={simulation.offTarget}
                    lockedCount={lockedCodes.length}
                    stale={stale}
                    free={free}
                    onFreeChange={setFree}
                    onShareChange={(blocId, value) =>
                      update(edit(scenario, blocId, (base) => adjustShare(base, blocId, value), { ...scenario, shares: { ...scenario.shares, [blocId]: value } }))
                    }
                    onBlankChange={(blank) => update(edit(scenario, BLANK_FIELD, (base) => adjustBlank(base, blank), { ...scenario, blank }))}
                    onRebalance={() => {
                      setAnchor(null);
                      update(rebalance(scenario, baseline.others, keptField));
                    }}
                    onReset={reset}
                  />
                ) : (
                  <ProvinceInputs
                    blocs={blocs}
                    rowBlocs={provinceBlocs}
                    base={base}
                    provinces={provinces}
                    code={code}
                    deputies={seats2026.get(code) ?? 0}
                    lockedCodes={lockedCodes}
                    shares={province.shares}
                    blank={province.blank}
                    others={othersShare(province)}
                    seats={provinceSeats(simulation.results, code)}
                    baseSeats={provinceSeats(baseline.simulation.results, code)}
                    offTarget={simulation.offTarget}
                    stale={stale}
                    onSelect={setCode}
                    free={free}
                    onFreeChange={setFree}
                    onShareChange={(blocId, value) =>
                      editProvince(edit(province, blocId, (base) => adjustShare(base, blocId, value), { ...province, shares: { ...province.shares, [blocId]: value } }))
                    }
                    onBlankChange={(blank) => editProvince(edit(province, BLANK_FIELD, (base) => adjustBlank(base, blank), { ...province, blank }))}
                    onRebalance={() => {
                      setAnchor(null);
                      editProvince(rebalance(province, othersShare(projected), keptField));
                    }}
                    onUnlock={unlockProvince}
                    onReset={reset}
                  />
                )}
              </div>
            </>
          ) : (
            <ReadOnlyNotice baseLabel={base.label} next={shared ? simulatorHref(shared) : "/simulator"} />
          )}
        </div>
        {/* Below the inputs on narrow screens so the seats come right after them. */}
        <div id={RESULTS_ID} className="flex scroll-mt-16 flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
          <ShareLink brokenLink={brokenLink} />
          {signedIn && <SaveSimulationContainer key={encodeScenario(valid)} scenario={valid} ranked={ranked} stale={stale} />}
          <ResultsHemicycle ranked={ranked} stale={stale} selected={picked} baseLabel={base.label} />
          <div className={`transition-opacity ${stale ? "opacity-40" : ""}`}>
            <CoalitionCalculator
              ranked={ranked}
              selected={picked}
              onToggle={toggle}
              coalitions={minimalWinningCoalitions(simulation.seats)}
            />
          </div>
        </div>
        <div className="lg:col-start-1">
          {/* Keyed by mode so a province pointed at in one mode is not kept in the other. */}
          <ProvinceMapContainer
            key={mode}
            blocs={blocs}
            results={simulation.results}
            stale={stale}
            selected={mode === "province" ? code : null}
            lockedCodes={lockedCodes}
            onPick={mode === "province" ? setCode : undefined}
            onDetail={showDetail}
          />
        </div>
        <div className="lg:col-start-1">
          <DhondtDetail
            blocs={blocs}
            provinces={provinces}
            code={code}
            deputies={result.seats}
            detail={dhondtDetail(result)}
            stale={stale}
            onSelect={setCode}
          />
        </div>
        <div className="lg:col-start-1">
          <HowSeatsWork />
        </div>
      </div>
    </>
  );
}
