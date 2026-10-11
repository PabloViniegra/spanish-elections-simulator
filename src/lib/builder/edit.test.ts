import { describe, expect, it } from "vitest";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import type { BuilderReference } from "./allocate";
import { addPartyHere, eligibleParties, fillFromLatest, nextOpen, setOtherVotes, setPartyVotes, setRunning, startProvince, voteCount } from "./edit";
import { MAX_VOTES } from "./schema";
import type { BuiltScenario } from "./types";

const reference: BuilderReference = {
  census: new Map(CONSTITUENCY_CODES.map((code) => [code, 1000])),
  catalog: new Map([
    ["pnv", { id: "pnv", acronym: "PNV", name: "Partido Nacionalista Vasco", colour: "#2a8343", provinces: ["01", "20", "48"], lastElection: "2023-07" }],
    ["eaj-pnv", { id: "pnv", acronym: "PNV", name: "Partido Nacionalista Vasco", colour: "#2a8343", provinces: ["01", "20", "48"], lastElection: "2023-07" }],
  ]),
};

const scenario: BuiltScenario = {
  schemaVersion: 1,
  seatTable: "2026",
  parties: [
    { id: "pnv", name: "PNV", colour: "#2a8343", catalogId: "pnv" },
    { id: "propio", name: "Mío", colour: "#000000" },
  ],
  provinces: {},
};

describe("voteCount", () => {
  it.each([
    [12.9, 12],
    [-3, 0],
    [Number.NaN, 0],
    [MAX_VOTES + 1, MAX_VOTES],
  ])("turns %s into %s", (value, expected) => {
    expect(voteCount(value)).toBe(expected);
  });
});

describe("editing a province", () => {
  it("starts it on first touch and keeps votes per party", () => {
    const running = setRunning(scenario, "48", "pnv", true);
    expect(running.provinces["48"]).toEqual({ votes: { pnv: 0 }, blank: 0, null: 0 });
    const voted = setOtherVotes(setOtherVotes(setPartyVotes(running, "48", "pnv", 300), "48", "blank", 5), "48", "null", 2);
    expect(voted.provinces["48"]).toEqual({ votes: { pnv: 300 }, blank: 5, null: 2 });
    expect(setRunning(voted, "48", "pnv", true).provinces["48"].votes).toEqual({ pnv: 300 });
    expect(setRunning(voted, "48", "pnv", false).provinces["48"].votes).toEqual({});
    expect(scenario.provinces).toEqual({});
  });
});

describe("starting from the census election", () => {
  const latest = { votes: { pnv: 164_188, bildu: 125_867 }, blank: 3391, null: 5251 };

  it("runs the parties of the list that ran there, without votes", () => {
    expect(startProvince(scenario, "48", reference, latest).provinces["48"]).toEqual({ votes: { pnv: 0 }, blank: 0, null: 0 });
    const started = setPartyVotes(scenario, "48", "propio", 7);
    expect(startProvince(started, "48", reference, latest)).toBe(started);
  });

  it("reads old catalogue ids as their bloc", () => {
    const old = { ...scenario, parties: [{ id: "eaj-pnv", name: "EAJ-PNV", colour: "#2a8343", catalogId: "eaj-pnv" }] };
    expect(startProvince(old, "48", reference, latest).provinces["48"].votes).toEqual({ "eaj-pnv": 0 });
  });

  it("fills only empty boxes of running parties", () => {
    const typed = setPartyVotes(setRunning(scenario, "48", "pnv", true), "48", "propio", 7);
    expect(fillFromLatest(typed, "48", reference, latest).provinces["48"]).toEqual({ votes: { pnv: 164_188, propio: 7 }, blank: 3391, null: 5251 });
    const kept = setOtherVotes(setPartyVotes(typed, "48", "pnv", 10), "48", "blank", 1);
    expect(fillFromLatest(kept, "48", reference, latest).provinces["48"]).toEqual({ votes: { pnv: 10, propio: 7 }, blank: 1, null: 5251 });
    expect(fillFromLatest(typed, "48", reference, undefined)).toBe(typed);
  });
});

describe("addPartyHere", () => {
  it("runs the new party in the province", () => {
    const parties = [...scenario.parties, { id: "nuevo", name: "Nuevo", colour: "#123456" }];
    const added = addPartyHere(scenario, "28", parties);
    expect(added.parties).toBe(parties);
    expect(added.provinces["28"].votes).toEqual({ nuevo: 0 });
    expect(addPartyHere(scenario, "28", scenario.parties).provinces).toEqual({});
  });
});

describe("eligibleParties", () => {
  it("keeps catalogue parties where they ran and invented ones everywhere", () => {
    expect(eligibleParties(scenario, "48", reference).map(({ id }) => id)).toEqual(["pnv", "propio"]);
    expect(eligibleParties(scenario, "28", reference).map(({ id }) => id)).toEqual(["propio"]);
  });
});

describe("nextOpen", () => {
  const complete = CONSTITUENCY_CODES.reduce((built, code) => setPartyVotes(built, code, "propio", 10), scenario);

  it("finds the first province left from the one given, wrapping round", () => {
    expect(nextOpen(scenario, reference)).toBe("01");
    const missing = { ...complete, provinces: Object.fromEntries(Object.entries(complete.provinces).filter(([code]) => code !== "03")) };
    expect(nextOpen(missing, reference, "10")).toBe("03");
  });

  it("stays put once every province is complete", () => {
    expect(nextOpen(complete, reference, "28")).toBe("28");
  });
});
