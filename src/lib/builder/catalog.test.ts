import { describe, expect, it } from "vitest";
import type { Election } from "@/lib/elections/types";
import { buildCatalog, catalogAliases, catalogId, catalogResults, displayName, NEUTRAL_COLOUR } from "./catalog";

const election = (id: string, candidacies: [string, string, string][], results: Record<string, [string, number][]>): Election => ({
  id,
  date: id,
  candidacies: candidacies.map(([candidacyId, acronym, name]) => ({ id: candidacyId, acronym, name })),
  constituencies: Object.entries(results).map(([code, votes]) => ({
    code,
    name: code,
    seats: 2,
    population: 0,
    census: 0,
    blankVotes: 0,
    nullVotes: 0,
    results: votes.map(([candidacyId, count]) => ({ candidacyId, votes: count, elected: 0 })),
  })),
});

describe("catalogId", () => {
  it("folds case, accents and punctuation", () => {
    expect(catalogId("JUNTS")).toBe(catalogId("Junts"));
    expect(catalogId(" EAJ-PNV ")).toBe("eaj-pnv");
    expect(catalogId("Compromís")).toBe("compromis");
    expect(catalogId("PUM+J")).toBe("pum-j");
    expect(catalogId("U.P.N.")).toBe(catalogId("UPN"));
  });
});

describe("displayName", () => {
  it.each([
    ["PARTIDO SOCIALISTA OBRERO ESPAÑOL", "PSOE", "Partido Socialista Obrero Español"],
    ["PARTIT DELS SOCIALISTES DE CATALUNYA (PSC-PSOE)", "PSC", "Partit dels Socialistes de Catalunya (PSC-PSOE)"],
    ["PARTIDO DOS SOCIALISTAS DE GALICIA-PSOE", "PSdeG-PSOE", "Partido dos Socialistas de Galicia-PSOE"],
    ["CANDIDATURA D'UNITAT POPULAR-PER LA RUPTURA", "CUP-PR", "Candidatura d'Unitat Popular-Per la Ruptura"],
    ["ESCAÑOS EN BLANCO PARA DEJAR ESCAÑOS VACÍOS", "ESCAÑOS EN BLANCO", "Escaños en Blanco para Dejar Escaños Vacíos"],
    ["FALANGE ESPAÑOLA DE LAS J.O.N.S.", "FE de las JONS", "Falange Española de las J.O.N.S."],
    ["SORIA ¡YA!", "SY", "Soria ¡Ya!"],
    ["VOX", "VOX", "Vox"],
  ])("writes %s as a reader would", (name, acronym, expected) => {
    expect(displayName(name, acronym)).toBe(expected);
  });
});

describe("buildCatalog", () => {
  const older = election("2019-11", [["1", "PNV", "Old name"], ["2", "GONE", "Gone party"]], { "48": [["1", 50], ["2", 5]], "20": [["1", 40]] });
  const newer = election("2023-07", [["7", "pnv", "New name"], ["8", "BIG", "Big party"]], { "48": [["7", 10], ["8", 900]] });
  const catalog = buildCatalog([
    { election: older, blocs: [{ id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["1"] }] },
    { election: newer, blocs: [] },
  ]);

  it("merges acronyms across elections with the latest name and every constituency", () => {
    expect(catalog.find(({ id }) => id === "pnv")).toEqual({
      id: "pnv",
      acronym: "pnv",
      name: "New Name",
      colour: "#2a8343",
      provinces: ["20", "48"],
      lastElection: "2023-07",
    });
  });

  it("orders by most recent election, then votes", () => {
    expect(catalog.map(({ id }) => id)).toEqual(["big", "pnv", "gone"]);
  });

  it("gives unmapped lists a neutral colour", () => {
    expect(catalog.find(({ id }) => id === "big")!.colour).toBe(NEUTRAL_COLOUR);
  });
});

describe("regional brands", () => {
  const base = {
    election: election("2023-07", [["1", "PSOE", "Partido Socialista Obrero Español"], ["2", "PSC", "Partit dels Socialistes de Catalunya"], ["3", "EAJ-PNV", "Euzko Alderdi Jeltzalea-Partido Nacionalista Vasco"], ["4", "FO", "Frente Obrero"]], {
      "28": [["1", 900], ["4", 3]],
      "08": [["2", 700]],
      "48": [["3", 160], ["4", 2]],
    }),
    blocs: [
      { id: "psoe", name: "PSOE", colour: "#e30613", candidacyIds: ["1", "2"] },
      { id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["3"] },
    ],
  };
  const catalog = buildCatalog([base]);

  it("count with their bloc, named after its most voted list", () => {
    expect(catalog.find(({ id }) => id === "psoe")).toEqual({
      id: "psoe",
      acronym: "PSOE",
      name: "Partido Socialista Obrero Español",
      colour: "#e30613",
      provinces: ["08", "28"],
      lastElection: "2023-07",
    });
    expect(catalog.map(({ acronym }) => acronym)).toEqual(["PSOE", "PNV", "FO"]);
  });

  it("keep their old ids as aliases of the bloc", () => {
    expect(catalogAliases([base], catalog)).toEqual({ psc: "psoe", "eaj-pnv": "pnv" });
  });

  it("add their votes to the bloc in each province", () => {
    expect(catalogResults(base)).toEqual({
      "28": { votes: { psoe: 900, fo: 3 }, blank: 0, null: 0 },
      "08": { votes: { psoe: 700 }, blank: 0, null: 0 },
      "48": { votes: { pnv: 160, fo: 2 }, blank: 0, null: 0 },
    });
  });
});
