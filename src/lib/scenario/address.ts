import { compressToEncodedURIComponent } from "lz-string";
import type { Scenario } from "./types";

// A later schema bumps the prefix and migrates older links.
export const SCENARIO_PREFIX = "v1.";
export const SCENARIO_PARAM = "e";
// The saved simulation the scenario was opened from, so it can be overwritten.
export const SAVED_PARAM = "s";
export const SHARE_URL_LIMIT = 2000;

export const simulatorHref = (param: string, savedId?: string) =>
  `/simulator?${SCENARIO_PARAM}=${encodeURIComponent(param)}${savedId ? `&${SAVED_PARAM}=${encodeURIComponent(savedId)}` : ""}`;

// The address to share: the scenario, without the saved simulation it came from.
export function withScenarioParam(currentHref: string, scenarioParam: string | null) {
  const url = new URL(currentHref);
  url.searchParams.delete(SAVED_PARAM);
  if (scenarioParam) url.searchParams.set(SCENARIO_PARAM, scenarioParam);
  else url.searchParams.delete(SCENARIO_PARAM);
  return url.href;
}

export function exceedsShareUrlLimit(href: string) {
  return href.length > SHARE_URL_LIMIT;
}

export function encodeScenario(scenario: Scenario) {
  return SCENARIO_PREFIX + compressToEncodedURIComponent(JSON.stringify(scenario));
}
