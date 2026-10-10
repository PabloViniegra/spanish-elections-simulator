"use client";

import dynamic from "next/dynamic";
import { dhondtDetail } from "@/lib/engine/last-seat";
import type { SimulatorInitialState } from "@/lib/scenario/initial";
import type { SavedTarget } from "./save-simulation";
import { encodeScenario, simulatorHref } from "@/lib/scenario/address";
import { provinces } from "@/lib/provinces";
import { CoalitionCalculator } from "./coalition-calculator";
import { CoalitionCombinationsContainer } from "./coalition-combinations-container";
import { DhondtDetail } from "./dhondt-detail";
import { HowSeatsWork } from "./how-seats-work";
import { ProvinceMapContainer } from "./province-map-container";
import { ResultsActions } from "./results-actions";
import { ResultsOverview } from "./results-overview";
import { RESULTS_ID, ResultsStrip } from "./results-strip";
import { ShareLinkContainer } from "./share-link-container";
import { SaveAccountNotice } from "./save-account-notice";
import { useSavedTarget } from "./use-saved-target";
import { useSimulator } from "./use-simulator";

const SimulatorInputs = dynamic(() => import("./simulator-inputs").then((module) => module.SimulatorInputs), { loading: () => <p role="status">Cargando controles del simulador…</p> });
const ExportResultsContainer = dynamic(() => import("./export-results-container").then((module) => module.ExportResultsContainer), { loading: () => <p role="status">Cargando descargas…</p> });
const SaveSimulationContainer = dynamic(() => import("./save-simulation-container").then((module) => module.SaveSimulationContainer), { loading: () => <p role="status">Cargando formulario…</p> });

// National (FR-02) and provincial (FR-03) modes over one scenario: the votes
// of a bundled election as the base (FR-01). Results follow the last valid
// scenario, which the address mirrors. Only saving requires authentication.
export function SimulatorContainer({ signedIn, initial, saved }: { signedIn: boolean; initial: SimulatorInitialState; saved: SavedTarget | null }) {
  const state = useSimulator(initial);
  const [target, keepTarget] = useSavedTarget(saved);
  const {
    brokenLink, valid, scenarioParam, base, blocs, simulation, ranked, stale,
    mode, code, setCode, lockedCodes, result, picked, toggle, showDetail,
  } = state;

  return (
    <>
      <ResultsStrip ranked={ranked} stale={stale} selected={picked} />
      <div className="mx-auto flex max-w-content flex-col gap-10 px-5 py-10 sm:px-8">
        {/* Two columns with the results pinned on the right; the rows below take the full width, so they sit outside this grid (a sticky box stays within the grid container, not its area). */}
        <div className="grid grid-cols-[minmax(0,1fr)] gap-10 [&>*]:min-w-0 lg:grid-cols-[minmax(0,5fr)_minmax(0,6fr)] lg:items-start lg:gap-x-16 lg:gap-y-6">
          <div className="flex flex-col gap-6">
            <SimulatorInputs state={state} />
          </div>
          <div id={RESULTS_ID} className="flex scroll-mt-16 flex-col gap-6 lg:sticky lg:top-6 lg:col-start-2 lg:row-span-2 lg:row-start-1">
            <ResultsOverview ranked={ranked} stale={stale} selected={picked} baseLabel={base.label} legendOnWide={mode === "province"} />
            <ResultsActions
              share={<ShareLinkContainer brokenLink={brokenLink} scenarioParam={scenarioParam} />}
              downloads={<ExportResultsContainer results={simulation.results} blocs={blocs} ranked={ranked} scenario={valid} baseId={base.election.id} baseLabel={base.label} stale={stale} />}
              save={signedIn
                ? <SaveSimulationContainer key={encodeScenario(valid)} scenario={valid} ranked={ranked} stale={stale} saved={target} onSaved={keepTarget} />
                : <SaveAccountNotice next={simulatorHref(encodeScenario(valid))} />}
            />
            <div className={`transition-opacity duration-150 ${stale ? "opacity-65" : ""}`}>
              <CoalitionCalculator
                ranked={ranked}
                selected={picked}
                onToggle={toggle}
              >
                <CoalitionCombinationsContainer ranked={ranked} />
              </CoalitionCalculator>
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
        </div>
        <DhondtDetail
          blocs={blocs}
          provinces={provinces}
          code={code}
          deputies={result.seats}
          detail={dhondtDetail(result)}
          stale={stale}
          onSelect={setCode}
        />
        <HowSeatsWork />
      </div>
    </>
  );
}
