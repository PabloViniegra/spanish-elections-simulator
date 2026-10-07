import type { Scenario } from "./types";

export function exportScenarioId(scenario: Scenario) {
  const serialized = JSON.stringify(scenario);
  let hash = 2_166_136_261;
  for (let index = 0; index < serialized.length; index += 1) {
    hash = Math.imul(hash ^ serialized.charCodeAt(index), 16_777_619);
  }
  return (hash >>> 0).toString(36);
}
