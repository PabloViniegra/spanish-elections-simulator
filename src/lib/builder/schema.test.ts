import { describe, expect, it } from "vitest";
import { BUILT_SCENARIO_MAX, MAX_PARTIES, MAX_VOTES, parseBuiltScenario } from "./schema";
import type { BuiltScenario } from "./types";

const valid: BuiltScenario = {
  schemaVersion: 1,
  seatTable: "2023",
  parties: [
    { id: "pp", name: "PP", colour: "#1d84ce", catalogId: "pp" },
    { id: "c1", name: "Mi partido", colour: "#123abc" },
  ],
  provinces: { "28": { votes: { pp: 100, c1: 0 }, blank: 5, null: 2 } },
};

describe("parseBuiltScenario", () => {
  it("accepts a well-formed scenario", () => {
    expect(parseBuiltScenario(JSON.stringify(valid))).toEqual(valid);
  });

  it("rejects broken JSON, other versions and oversized input", () => {
    expect(parseBuiltScenario("{")).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, schemaVersion: 2 }))).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, seatTable: "2019" }))).toBeNull();
    expect(parseBuiltScenario(" ".repeat(BUILT_SCENARIO_MAX + 1))).toBeNull();
  });

  it("rejects repeated parties or catalogue entries and too many parties", () => {
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: [valid.parties[0], { ...valid.parties[1], id: "pp" }] }))).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: [valid.parties[0], { ...valid.parties[1], catalogId: "pp" }] }))).toBeNull();
    const many = Array.from({ length: MAX_PARTIES + 1 }, (_, i) => ({ id: `c${i}`, name: `P${i}`, colour: "#000000" }));
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: many, provinces: {} }))).toBeNull();
  });

  it("rejects bad party fields", () => {
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: [{ ...valid.parties[1], name: "  " }] }))).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: [{ ...valid.parties[1], colour: "red" }] }))).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, parties: [{ ...valid.parties[1], id: "Not An Id" }] }))).toBeNull();
  });

  it("rejects unknown provinces or parties and invalid vote counts", () => {
    expect(parseBuiltScenario(JSON.stringify({ ...valid, provinces: { "53": valid.provinces["28"] } }))).toBeNull();
    expect(parseBuiltScenario(JSON.stringify({ ...valid, provinces: { "28": { votes: { psoe: 1 }, blank: 0, null: 0 } } }))).toBeNull();
    for (const bad of [-1, 1.5, MAX_VOTES + 1]) {
      expect(parseBuiltScenario(JSON.stringify({ ...valid, provinces: { "28": { votes: { pp: bad }, blank: 0, null: 0 } } }))).toBeNull();
      expect(parseBuiltScenario(JSON.stringify({ ...valid, provinces: { "28": { votes: {}, blank: bad, null: 0 } } }))).toBeNull();
    }
  });
});
