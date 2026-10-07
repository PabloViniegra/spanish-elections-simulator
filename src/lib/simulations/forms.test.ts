import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { baselineOf } from "@/lib/scenario/baselines";
import { encodeScenario } from "@/lib/scenario/url";
import { saveSimulationSchema } from "./forms";

const scenario = encodeScenario(baselineOf(defaultBase).scenario);

describe("saveSimulationSchema", () => {
  it("accepts a named scenario that restores", () => {
    expect(saveSimulationSchema.parse({ name: "  Empate  ", scenario })).toEqual({ name: "Empate", scenario });
  });

  it("rejects a blank name and a broken scenario", () => {
    const result = saveSimulationSchema.safeParse({ name: " ", scenario: "v1.roto" });
    expect(result.error?.issues.map(({ path }) => path[0])).toEqual(["name", "scenario"]);
  });
});
