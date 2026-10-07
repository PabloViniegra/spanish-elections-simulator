import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { baseScenario } from "./simulate";
import { exportScenarioId } from "./export-file-name";

describe("exportScenarioId", () => {
  it("returns a stable identifier for an unchanged scenario", () => {
    const scenario = baseScenario(defaultBase.election, defaultBase.blocs);
    expect(exportScenarioId(scenario)).toBe(exportScenarioId(structuredClone(scenario)));
  });

  it("distinguishes scenarios with different inputs", () => {
    const scenario = baseScenario(defaultBase.election, defaultBase.blocs);
    const changed = { ...scenario, shares: { ...scenario.shares, pp: scenario.shares.pp + 1 } };
    expect(exportScenarioId(changed)).not.toBe(exportScenarioId(scenario));
    expect(exportScenarioId(scenario)).toMatch(/^[a-z0-9]+$/);
  });
});
