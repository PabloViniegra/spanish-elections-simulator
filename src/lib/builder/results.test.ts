import { describe, expect, it } from "vitest";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import type { ConstituencyResult } from "@/lib/engine/types";
import type { BuilderReference } from "./allocate";
import { nationalTotals, seatTotals, summarizeBuilt } from "./results";
import type { BuiltScenario } from "./types";

const reference: BuilderReference = {
  census: new Map(CONSTITUENCY_CODES.map((code) => [code, 1_000])),
  catalog: new Map(),
};

const parties: BuiltScenario["parties"] = [
  { id: "a", name: "A", colour: "#111111" },
  { id: "b", name: "B", colour: "#222222" },
  { id: "c", name: "C", colour: "#333333" },
];

const complete: BuiltScenario = {
  schemaVersion: 1,
  seatTable: "2026",
  parties,
  provinces: Object.fromEntries(CONSTITUENCY_CODES.map((code) => [code, { votes: { a: 600, b: 300 }, blank: 100, null: 0 }])),
};

const result = (code: string, validVotes: number, candidacies: [string, number, number][]): ConstituencyResult => ({
  code,
  seats: 0,
  validVotes,
  candidacies: candidacies.map(([id, votes, seats]) => ({ id, votes, seats, excluded: false })),
  awards: [],
  vacantSeats: 0,
});

describe("seatTotals", () => {
  it("adds up each party's seats across constituencies", () => {
    expect(seatTotals([result("01", 10, [["a", 6, 2], ["b", 4, 1]]), result("02", 10, [["a", 5, 1]])])).toEqual(new Map([["a", 3], ["b", 1]]));
  });
});

describe("nationalTotals", () => {
  it("ranks parties by seats and then votes, with shares of the valid vote", () => {
    const scenario = { ...complete, provinces: { "01": { votes: { a: 50, b: 30, c: 0 }, blank: 20, null: 5 } } };
    const totals = nationalTotals(scenario, [result("01", 100, [["a", 50, 1], ["b", 30, 1], ["c", 0, 0]])]);
    expect(totals.rows.map(({ id, votes, seats, share }) => [id, votes, seats, share])).toEqual([
      ["a", 50, 1, 0.5],
      ["b", 30, 1, 0.3],
    ]);
    expect(totals).toMatchObject({ blank: 20, blankShare: 0.2, valid: 100 });
  });

  it("has no shares without valid votes", () => {
    expect(nationalTotals({ ...complete, provinces: {} }, []).blankShare).toBe(0);
  });
});

describe("summarizeBuilt", () => {
  it("counts complete provinces and ranks nobody until all are", () => {
    const partial = { ...complete, provinces: { "28": complete.provinces["28"] } };
    expect(summarizeBuilt(JSON.stringify(partial), reference)).toEqual({ completed: 1, ranked: null });
  });

  it("ranks the parties with seats once all 52 are complete", () => {
    const summary = summarizeBuilt(JSON.stringify(complete), reference);
    expect(summary?.completed).toBe(52);
    expect(summary?.ranked?.map(({ id }) => id)).toEqual(["a", "b"]);
    expect(summary?.ranked?.reduce((sum, { seats }) => sum + seats, 0)).toBe(350);
  });

  it("is null when the election no longer reads", () => {
    expect(summarizeBuilt("{", reference)).toBeNull();
  });
});
