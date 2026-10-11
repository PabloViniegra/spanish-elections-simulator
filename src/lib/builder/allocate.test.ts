import { describe, expect, it } from "vitest";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { seats2026 } from "@/lib/seats-2026";
import { allocateBuilt, allocateProvince, type BuilderReference, partyBlocs, provinceStatus } from "./allocate";
import { builderReference, catalog, seatTables } from "./reference";
import type { BuiltScenario, CatalogParty } from "./types";

const regional: CatalogParty = {
  id: "pnv",
  acronym: "EAJ-PNV",
  name: "EUZKO ALDERDI JELTZALEA",
  colour: "#2a8343",
  provinces: ["01", "20", "48"],
  lastElection: "2023-07",
};
const reference: BuilderReference = {
  census: new Map(CONSTITUENCY_CODES.map((code) => [code, 1_000])),
  catalog: new Map([[regional.id, regional]]),
};

const scenario = (provinces: BuiltScenario["provinces"]): BuiltScenario => ({
  schemaVersion: 1,
  seatTable: "2026",
  parties: [
    { id: "a", name: "A", colour: "#111111" },
    { id: "b", name: "B", colour: "#222222" },
    { id: "pnv", name: "PNV", colour: "#2a8343", catalogId: "pnv" },
  ],
  provinces,
});

describe("provinceStatus", () => {
  it("is empty until the user starts the province", () => {
    expect(provinceStatus(scenario({}), "28", reference)).toBe("empty");
  });

  it("needs votes for at least one party", () => {
    expect(provinceStatus(scenario({ "28": { votes: { a: 0 }, blank: 10, null: 5 } }), "28", reference)).toBe("incomplete");
    expect(provinceStatus(scenario({ "28": { votes: { a: 1 }, blank: 0, null: 0 } }), "28", reference)).toBe("complete");
  });

  it("counts party, blank and null votes against the census, which may be reached exactly", () => {
    expect(provinceStatus(scenario({ "28": { votes: { a: 500, b: 300 }, blank: 100, null: 100 } }), "28", reference)).toBe("complete");
    expect(provinceStatus(scenario({ "28": { votes: { a: 500, b: 300 }, blank: 100, null: 101 } }), "28", reference)).toBe("over-census");
  });

  it("keeps a catalogue party within the constituencies where it ran", () => {
    expect(provinceStatus(scenario({ "48": { votes: { pnv: 10 }, blank: 0, null: 0 } }), "48", reference)).toBe("complete");
    expect(provinceStatus(scenario({ "28": { votes: { pnv: 10 }, blank: 0, null: 0 } }), "28", reference)).toBe("invalid-party");
  });
});

describe("allocateProvince", () => {
  it("runs only the parties entered, applies the 3% threshold with blank votes and leaves null votes out", () => {
    // Madrid elects 38: 3,000 valid votes put the threshold at 90.
    const result = allocateProvince(scenario({ "28": { votes: { a: 2_000, b: 89 }, blank: 911, null: 500 } }), "28", seats2026);
    expect(result.validVotes).toBe(3_000);
    expect(result.candidacies.map(({ id }) => id)).toEqual(["a", "b"]);
    expect(result.candidacies[1]).toMatchObject({ excluded: true, seats: 0 });
    expect(result.candidacies[0].seats).toBe(38);
  });

  it("leaves every seat vacant in an empty province", () => {
    expect(allocateProvince(scenario({}), "51", seats2026).vacantSeats).toBe(1);
  });
});

describe("allocateBuilt", () => {
  const complete = Object.fromEntries(CONSTITUENCY_CODES.map((code) => [code, { votes: { a: 600, b: 300 }, blank: 0, null: 0 }]));

  it("waits for all 52 constituencies", () => {
    const { "52": _melilla, ...missing } = complete;
    expect(allocateBuilt(scenario(missing), seats2026, reference)).toBeNull();
    expect(allocateBuilt(scenario({ ...complete, "52": { votes: { a: 0 }, blank: 0, null: 0 } }), seats2026, reference)).toBeNull();
  });

  it("allocates the 350 seats with the chosen seat table", () => {
    const results = allocateBuilt(scenario(complete), seatTables["2023"], reference)!;
    const seats = results.flatMap(({ candidacies }) => candidacies).reduce((sum, { seats: won }) => sum + won, 0);
    expect(results).toHaveLength(52);
    expect(seats).toBe(350);
    expect(results.find(({ code }) => code === "11")!.seats).toBe(9);
  });
});

describe("partyBlocs", () => {
  it("turns each party into a bloc of its own", () => {
    expect(partyBlocs(scenario({}))[2]).toEqual({ id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["pnv"] });
  });
});

describe("builder reference data", () => {
  it("has a census for every constituency", () => {
    expect([...builderReference.census.keys()].sort()).toEqual(CONSTITUENCY_CODES);
  });

  it("lists each catalogue party once, only in real constituencies", () => {
    expect(new Set(catalog.map(({ id }) => id)).size).toBe(catalog.length);
    expect(catalog.every(({ provinces }) => provinces.length > 0 && provinces.every((code) => CONSTITUENCY_CODES.includes(code)))).toBe(true);
  });
});
