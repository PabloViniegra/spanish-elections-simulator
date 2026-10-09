import { useEffect } from "react";
import { SCENARIO_PARAM } from "@/lib/scenario/address";

// The address mirrors the scenario without adding history entries; null
// leaves it bare.
export function useScenarioAddress(scenarioParam: string | null) {
  useEffect(() => {
    const url = new URL(window.location.href);
    if (scenarioParam === null) url.searchParams.delete(SCENARIO_PARAM);
    else url.searchParams.set(SCENARIO_PARAM, scenarioParam);
    window.history.replaceState(null, "", url);
  }, [scenarioParam]);
}
