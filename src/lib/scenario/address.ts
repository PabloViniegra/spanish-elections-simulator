import { compressToEncodedURIComponent } from "lz-string";
import type { Scenario } from "./types";

// A later schema bumps the prefix and migrates older links.
export const SCENARIO_PREFIX = "v1.";
export const SCENARIO_PARAM = "e";
export const SHARE_URL_LIMIT = 2000;

export const simulatorHref = (param: string) => `/simulator?${SCENARIO_PARAM}=${encodeURIComponent(param)}`;

export function withScenarioParam(currentHref: string, scenarioParam: string | null) {
  const url = new URL(currentHref);
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
