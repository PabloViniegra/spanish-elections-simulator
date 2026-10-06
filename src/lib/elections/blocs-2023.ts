import type { Bloc } from "./types";

// Default blocs for the July 2023 base (R-08). Regional lists of PSOE, PP and
// Sumar count with their national party, Compromís included; every other
// candidacy with a seat is its own bloc. Ids are the Infoelectoral candidacy
// codes in src/data/elections/2023-07.json.
export const blocs2023: Bloc[] = [
  { id: "pp", name: "PP", colour: "#1d84ce", candidacyIds: ["5", "48", "56"] },
  { id: "psoe", name: "PSOE", colour: "#e30613", candidacyIds: ["2", "29", "47", "64", "72", "76"] },
  { id: "vox", name: "Vox", colour: "#63be21", candidacyIds: ["6"] },
  {
    id: "sumar",
    name: "Sumar",
    colour: "#e51c55",
    candidacyIds: ["10", "11", "21", "30", "33", "51", "66", "82"],
  },
  { id: "erc", name: "ERC", colour: "#ffb232", candidacyIds: ["50"] },
  { id: "junts", name: "Junts", colour: "#00c3b2", candidacyIds: ["57"] },
  { id: "bildu", name: "EH Bildu", colour: "#b5cf18", candidacyIds: ["71"] },
  { id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["75"] },
  { id: "bng", name: "BNG", colour: "#76b3dd", candidacyIds: ["65"] },
  { id: "cc", name: "CC", colour: "#ffd700", candidacyIds: ["31"] },
  { id: "upn", name: "UPN", colour: "#2b4c8c", candidacyIds: ["74"] },
];
