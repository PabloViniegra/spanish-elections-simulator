"use client";

import { useActionState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import type { Scenario } from "@/lib/scenario/types";
import { encodeScenario } from "@/lib/scenario/url";
import { saveSimulation } from "@/lib/simulations/actions";
import { SaveSimulation } from "./save-simulation";

// Saves the scenario the results show: the last one that fits in 100%.
export function SaveSimulationContainer({ scenario }: { scenario: Scenario }) {
  const [state, action, pending] = useActionState(saveSimulation, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref}>
      <SaveSimulation state={state} action={action} pending={pending} scenario={encodeScenario(scenario)} />
    </div>
  );
}
