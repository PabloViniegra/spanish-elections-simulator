"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import type { Scenario } from "@/lib/scenario/types";
import { encodeScenario } from "@/lib/scenario/url";
import { saveSimulation } from "@/lib/simulations/actions";
import { SaveSimulation } from "./save-simulation";

type SaveSimulationContainerProps = {
  // The scenario the results show: the last one that fits in 100%.
  scenario: Scenario;
  ranked: readonly { name: string; seats: number }[];
  stale: boolean;
};

// Keyed by the scenario where it is used, so "saved" never outlives an edit.
export function SaveSimulationContainer({ scenario, ranked, stale }: SaveSimulationContainerProps) {
  const [state, action, pending] = useActionState(saveSimulation, undefined);
  const ref = useFocusOnError(state);
  const defaultName = ranked
    .slice(0, 3)
    .map(({ name, seats }) => `${name} ${seats}`)
    .join(" · ");
  return (
    <div ref={ref}>
      <SaveSimulation state={state} action={action} pending={pending} scenario={encodeScenario(scenario)} defaultName={defaultName} stale={stale} />
    </div>
  );
}
