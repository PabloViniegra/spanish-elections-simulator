import { useSyncExternalStore } from "react";
import { baseOptions } from "@/lib/elections/base-options";
import { othersShare, provinceSeats } from "@/lib/scenario/simulate";
import { provinces } from "@/lib/provinces";
import { currentElection, simulationSeats } from "@/lib/elections/current";
import { BaseSelect } from "./base-select";
import { BlocManagerContainer } from "./bloc-manager-container";
import { ModeSwitch } from "./mode-switch";
import { NationalInputs } from "./national-inputs";
import { ProvinceInputs } from "./province-inputs";
import { UndoNotice } from "./undo-notice";
import type { useSimulator } from "./use-simulator";

const subscribeNever = () => () => {};

export function SimulatorInputs({ state }: { state: ReturnType<typeof useSimulator> }) {
  // SSR controls cannot accept edits before their lazy-loaded handlers hydrate.
  const hydrated = useSyncExternalStore(subscribeNever, () => true, () => false);
  const { base, mode, setMode, notice, undo, scenario, editBlocs, simulation, baseline, lockedCodes, stale, free, setFree, nationalEdits, reset, blocs, provinceBlocs, code, province, provinceEdits, setCode, unlockProvince, changeBase, updateUnanchored, restart, changingBase } = state;
  return (
    <fieldset disabled={!hydrated || changingBase} aria-busy={!hydrated || changingBase} className="flex min-w-0 flex-col gap-6">
      <legend className="sr-only">Editar escenario</legend>
      <div className="grid gap-3 sm:grid-cols-2 sm:items-end">
        <BaseSelect bases={baseOptions} value={base.election.id} onChange={changeBase} />
        <ModeSwitch mode={mode} onChange={setMode} />
      </div>
      <p className="text-caption text-pretty text-ink-muted-80">
        Votos de partida: {base.label}. Reparto provincial de escaños: {currentElection.label}.
        {" "}La comparación usa esos mismos escaños, no el resultado histórico oficial.
      </p>
      <details className="text-caption text-ink-muted-80">
        <summary className="min-h-11 cursor-pointer py-3 font-semibold text-ink">Cómo se proyecta tu estimación</summary>
        <div className="flex flex-col gap-2 pb-3 text-pretty">
          <p>El voto de cada partido se distribuye tomando como referencia dónde obtuvo votos en la elección de partida. No es una encuesta ni una predicción de cómo votará cada provincia.</p>
          <p>Puedes ajustar el voto en «Por provincia». «Otros partidos» agrupa el voto no modelado y no recibe escaños. Si falta un partido, añádelo en «Editar partidos» e introduce su porcentaje.</p>
        </div>
      </details>
      <p role="status" className={changingBase ? "text-caption" : "sr-only"}>{changingBase ? "Cargando votos de partida…" : ""}</p>
      <UndoNotice notice={notice} onUndo={undo} />
      <div key={mode} className="settle">
        {mode === "national" ? (
          <NationalInputs blocs={editBlocs} base={base} shares={scenario.shares} blank={scenario.blank} others={othersShare(scenario)} seats={simulation.seats} baseSeats={baseline.simulation.seats} offTarget={simulation.offTarget} lockedCount={lockedCodes.length} stale={stale} free={free} onFreeChange={setFree} {...nationalEdits} onReset={reset} />
        ) : (
          <ProvinceInputs blocs={blocs} rowBlocs={provinceBlocs} base={base} provinces={provinces} code={code} deputies={simulationSeats.get(code) ?? 0} lockedCodes={lockedCodes} shares={province.shares} blank={province.blank} others={othersShare(province)} seats={provinceSeats(simulation.results, code)} baseSeats={provinceSeats(baseline.simulation.results, code)} offTarget={simulation.offTarget} stale={stale} onSelect={setCode} free={free} onFreeChange={setFree} {...provinceEdits} onUnlock={unlockProvince} onReset={reset} />
        )}
      </div>
      <BlocManagerContainer base={base} scenario={scenario} onChange={updateUnanchored} onRestart={restart} />
    </fieldset>
  );
}
