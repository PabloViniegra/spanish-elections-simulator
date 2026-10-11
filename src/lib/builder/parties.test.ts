import { describe, expect, it } from "vitest";
import { addCatalogParty, addCustomParty, recolourParty, removeParty } from "./parties";
import { MAX_PARTIES } from "./schema";
import type { BuiltParty, CatalogParty } from "./types";

const pp: CatalogParty = { id: "pp", acronym: "PP", name: "Partido Popular", colour: "#1d84ce", provinces: ["28"], lastElection: "2023-07" };

describe("addCatalogParty", () => {
  it("adds the party once, named by its acronym", () => {
    const once = addCatalogParty([], pp);
    expect(once).toEqual([{ id: "pp", name: "PP", colour: "#1d84ce", catalogId: "pp" }]);
    expect(addCatalogParty(once, pp)).toEqual(once);
  });

  it("finds a free id when an invented party took it", () => {
    expect(addCatalogParty([{ id: "pp", name: "Mío", colour: "#000000" }], pp)[1].id).toBe("pp-2");
  });
});

describe("addCustomParty", () => {
  it("adds trimmed names with their own ids and colours", () => {
    const parties = addCustomParty(addCustomParty([], "  Uno "), "Dos");
    expect(parties.map(({ id, name }) => [id, name])).toEqual([["propio", "Uno"], ["propio-2", "Dos"]]);
    expect(parties[0].colour).not.toBe(parties[1].colour);
  });

  it("ignores blank names", () => {
    expect(addCustomParty([], "   ")).toEqual([]);
  });
});

describe("party limit", () => {
  it("adds nothing past MAX_PARTIES", () => {
    const full: BuiltParty[] = Array.from({ length: MAX_PARTIES }, (_, i) => ({ id: `p${i}`, name: `P${i}`, colour: "#000000" }));
    expect(addCustomParty(full, "Otro")).toHaveLength(MAX_PARTIES);
    expect(addCatalogParty(full, pp)).toHaveLength(MAX_PARTIES);
  });
});

describe("removeParty and recolourParty", () => {
  const parties = addCustomParty(addCatalogParty([], pp), "Mío");

  it("touch only the party named", () => {
    expect(removeParty(parties, "pp").map(({ id }) => id)).toEqual(["propio"]);
    expect(recolourParty(parties, "propio", "#ffffff").map(({ colour }) => colour)).toEqual(["#1d84ce", "#ffffff"]);
  });
});
