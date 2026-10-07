import type { Bloc } from "./types";

// Default blocs for the April 2019 base (R-08). Regional lists count with their
// national party, En Comú Podem with Unidas Podemos; every other candidacy with
// a seat is its own bloc. Ids are the Infoelectoral candidacy codes in
// src/data/elections/2019-04.json.
export const blocs2019Apr: Bloc[] = [
  { id: "psoe", name: "PSOE", colour: "#e30613", candidacyIds: ["92", "93", "94", "96", "97"] },
  { id: "pp", name: "PP", colour: "#1d84ce", candidacyIds: ["83", "84", "85", "86"] },
  { id: "cs", name: "Cs", colour: "#eb6109", candidacyIds: ["22", "23"] },
  {
    id: "up",
    name: "Unidas Podemos",
    colour: "#6b2e68",
    candidacyIds: ["32", "74", "75", "76", "77", "78", "79", "80", "81", "82"],
  },
  { id: "vox", name: "Vox", colour: "#63be21", candidacyIds: ["117"] },
  { id: "erc", name: "ERC", colour: "#ffb232", candidacyIds: ["37"] },
  { id: "junts", name: "JxCat", colour: "#00c3b2", candidacyIds: ["49"] },
  { id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["27"] },
  { id: "bildu", name: "EH Bildu", colour: "#b5cf18", candidacyIds: ["33"] },
  { id: "cc", name: "CC", colour: "#ffd700", candidacyIds: ["15"] },
  { id: "na", name: "NA+", colour: "#2b4c8c", candidacyIds: ["52"] },
  { id: "compromis", name: "Compromís", colour: "#da8b3a", candidacyIds: ["20"] },
  { id: "prc", name: "PRC", colour: "#8a7a0b", candidacyIds: ["90"] },
];
