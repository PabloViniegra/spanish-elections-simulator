import type { Bloc } from "./types";

// Default blocs for the June 2016 base (R-08). Regional lists and coalitions
// count with their national party (UPN-PP with PP, PSOE-NCa with PSOE; En Comú,
// Compromís-Podemos and En Marea with Unidos Podemos); every other candidacy
// with a seat is its own bloc. Vox, without seats then, keeps a bloc so it can
// be simulated. Ids are the Infoelectoral candidacy codes in
// src/data/elections/2016-06.json.
export const blocs2016: Bloc[] = [
  { id: "pp", name: "PP", colour: "#1d84ce", candidacyIds: ["68", "69", "70", "71", "92"] },
  { id: "psoe", name: "PSOE", colour: "#e30613", candidacyIds: ["74", "75", "76", "77", "78"] },
  {
    id: "up",
    name: "Unidos Podemos",
    colour: "#6b2e68",
    candidacyIds: ["22", "54", "55", "56", "57", "59", "60", "61", "62", "63", "64", "65", "66", "67", "89"],
  },
  { id: "cs", name: "Cs", colour: "#eb6109", candidacyIds: ["13", "14", "15"] },
  { id: "erc", name: "ERC", colour: "#ffb232", candidacyIds: ["25"] },
  { id: "cdc", name: "CDC", colour: "#18307b", candidacyIds: ["10"] },
  { id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["16"] },
  { id: "bildu", name: "EH Bildu", colour: "#b5cf18", candidacyIds: ["23"] },
  { id: "cc", name: "CC", colour: "#ffd700", candidacyIds: ["7"] },
  { id: "vox", name: "Vox", colour: "#63be21", candidacyIds: ["94"] },
];
