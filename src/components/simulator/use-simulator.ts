"use client";

import { useState, useTransition } from "react";
import { notify } from "@/components/feedback/notify";
import { loadBase } from "@/lib/elections/load-base";
import { baselineFor, baselineOf } from "@/lib/scenario/baselines";
import { rankedBlocs, scenarioBlocs } from "@/lib/scenario/blocs";
import { adjustBlank, adjustShare, rebalance } from "@/lib/scenario/rebalance";
import { fitsInFull, othersShare, provinceShares, simulate } from "@/lib/scenario/simulate";
import type { ProvinceShares, Scenario } from "@/lib/scenario/types";
import type { SimulatorInitialState } from "@/lib/scenario/initial";
import { encodeScenario } from "@/lib/scenario/address";
import { provinces } from "@/lib/provinces";
import { seats2026 } from "@/lib/seats-2026";
import { DHONDT_ID } from "./ids";
import type { InputMode } from "./mode-switch";
import { useScenario } from "./use-scenario";
import { useScenarioAddress } from "./use-scenario-address";

// Anchor field for the blank vote, apart from any bloc id.
const BLANK_FIELD = "blank";

// `code` only ever comes from the province list, so a miss is a bug.
function found<T>(value: T | undefined, code: string): T {
  if (value === undefined) throw new Error(`Unknown province ${code}`);
  return value;
}

// The simulator's state: the scenario being edited, the last one that fits in
// 100% (which the results and the address follow), and the province in view.
export function useSimulator(initial: SimulatorInitialState) {
  const [loadedBases, setLoadedBases] = useState(() => new Map([[initial.base.election.id, initial.base]]));
  const [changingBase, startBaseChange] = useTransition();
  const { scenario, valid, notice, update, discard, undo } = useScenario(initial.scenario ?? baselineOf(initial.base).scenario);
  const base = loadedBases.get(valid.baseElectionId) ?? initial.base;
  // Results follow the blocs of the last valid scenario, the inputs those
  // being edited (FR-11).
  const blocs = scenarioBlocs(valid, base);
  const editBlocs = scenarioBlocs(scenario, base);
  const baseline = baselineFor(base, blocs);
  const scenarioParam = base.election.id === "2023-07" && valid === baselineOf(base).scenario ? null : encodeScenario(valid);
  const [selected, setSelected] = useState<ReadonlySet<string>>(new Set());
  const [mode, setMode] = useState<InputMode>("national");
  const [code, setCode] = useState("28");
  const [free, setFree] = useState(false);
  // The field being edited and the shares when it started moving: automatic
  // adjustment scales from there, and squaring up by hand keeps that field.
  const [anchor, setAnchor] = useState<{ scope: string; field: string; base: ProvinceShares } | null>(null);
  useScenarioAddress(scenarioParam);

  const scope = mode === "national" ? mode : code;
  const edit = <T extends ProvinceShares>(current: T, field: string, apply: (base: T) => T, plain: T) => {
    // SAFETY: the scope pins the shape: national anchors hold the scenario,
    // provincial ones that province's shares, the same type as `current`.
    const base = anchor?.scope === scope && anchor.field === field ? (anchor.base as T) : current;
    setAnchor({ scope, field, base });
    return free ? plain : apply(base);
  };
  const keptField = anchor?.scope === scope && anchor.field !== BLANK_FIELD ? anchor.field : undefined;
  // Share, blank and rebalance edits over the national or one province's shares.
  const editsOf = <T extends ProvinceShares>(current: T, commit: (next: T) => void, others: number) => ({
    onShareChange: (blocId: string, value: number) =>
      commit(edit(current, blocId, (from) => adjustShare(from, blocId, value), { ...current, shares: { ...current.shares, [blocId]: value } })),
    onBlankChange: (blank: number) => commit(edit(current, BLANK_FIELD, (from) => adjustBlank(from, blank), { ...current, blank })),
    onRebalance: () => {
      setAnchor(null);
      commit(rebalance(current, others, keptField));
    },
  });
  // FR-04: starting over throws edits away, so it can be undone.
  const restart = (next: Scenario, message: string) => {
    setAnchor(null);
    discard(next, message);
  };
  // Edits that change what the anchored shares refer to start a fresh one.
  const updateUnanchored = (next: Scenario) => {
    setAnchor(null);
    update(next);
  };
  const reset = () => restart(baseline.scenario, `Escenario restablecido a los resultados de ${base.label}.`);
  const changeBase = (id: string) => {
    startBaseChange(async () => {
      try {
        const next = loadedBases.get(id) ?? await loadBase(id);
        if (!next) return;
        setLoadedBases((loaded) => new Map(loaded).set(id, next));
        restart(baselineOf(next).scenario, `Votos de partida: generales de ${next.label}.`);
      } catch {
        notify.error({ title: "No se ha podido cargar la elección", description: "Vuelve a seleccionarla para intentarlo de nuevo." });
      }
    });
  };

  const stale = !fitsInFull(scenario);
  const simulation = simulate(valid, base.election, blocs, seats2026);
  const lockedCodes = provinces.map((province) => province.code).filter((locked) => scenario.provinces?.[locked]);
  // Locking a province starts from its projection, so nothing moves until the
  // user changes a share.
  const projected = provinceShares(found(simulation.provinces.get(code), code), blocs);
  const province = scenario.provinces?.[code] ?? projected;
  // Regional blocs only appear where they ran in the base election (P-05) or
  // the user gave them votes; blocs without candidacies run everywhere.
  const provinceBlocs = editBlocs.filter((bloc) =>
    bloc.candidacyIds.length === 0 || (baseline.simulation.provinces.get(code)?.get(bloc.id) ?? 0) > 0 || (province.shares[bloc.id] ?? 0) > 0,
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
  const result = found(
    simulation.results.find((constituency) => constituency.code === code),
    code,
  );
  // Coalition picks carry over between bases where the bloc still exists.
  const picked = new Set([...selected].filter((blocId) => blocs.some((bloc) => bloc.id === blocId)));
  const toggle = (blocId: string) => {
    const next = new Set(picked);
    if (!next.delete(blocId)) next.add(blocId);
    setSelected(next);
  };

  return {
    shared: initial.shared,
    brokenLink: initial.brokenLink,
    changingBase,
    scenario,
    valid,
    scenarioParam,
    notice,
    undo,
    base,
    blocs,
    editBlocs,
    baseline,
    simulation,
    ranked: rankedBlocs(blocs, simulation.seats),
    stale,
    mode,
    setMode,
    code,
    setCode,
    free,
    setFree,
    lockedCodes,
    province,
    provinceBlocs,
    result,
    picked,
    toggle,
    nationalEdits: editsOf(scenario, update, baseline.others),
    provinceEdits: editsOf(province, editProvince, othersShare(projected)),
    restart,
    updateUnanchored,
    reset,
    changeBase,
    unlockProvince,
    showDetail,
  };
}
