import type { Bloc } from "./types";

// Default blocs for the November 2019 base (R-08). Regional lists count with
// their national party, En Comú Podem with Unidas Podemos and Més Compromís
// with Más País; the two Canarian CC-NC lists form one bloc; every other
// candidacy with a seat is its own bloc. Ids are the Infoelectoral candidacy
// codes in src/data/elections/2019-11.json.
export const blocs2019Nov: Bloc[] = [
  { id: "psoe", name: "PSOE", colour: "#e30613", candidacyIds: ["90", "91", "92", "93", "94"] },
  { id: "pp", name: "PP", colour: "#1d84ce", candidacyIds: ["83", "84", "85", "86"] },
  { id: "vox", name: "Vox", colour: "#63be21", candidacyIds: ["116"] },
  {
    id: "up",
    name: "Unidas Podemos",
    colour: "#6b2e68",
    candidacyIds: ["28", "74", "75", "76", "77", "78", "79", "80", "81", "82"],
  },
  { id: "erc", name: "ERC", colour: "#ffb232", candidacyIds: ["31"] },
  { id: "cs", name: "Cs", colour: "#eb6109", candidacyIds: ["18", "19"] },
  { id: "junts", name: "JxCat", colour: "#00c3b2", candidacyIds: ["41"] },
  { id: "pnv", name: "PNV", colour: "#2a8343", candidacyIds: ["22"] },
  { id: "bildu", name: "EH Bildu", colour: "#b5cf18", candidacyIds: ["29"] },
  { id: "mas-pais", name: "Más País", colour: "#0bb38b", candidacyIds: ["43", "44", "45", "46", "48"] },
  { id: "cup", name: "CUP", colour: "#ece100", candidacyIds: ["20"] },
  { id: "cc", name: "CC-NC", colour: "#ffd700", candidacyIds: ["13", "54"] },
  { id: "na", name: "NA+", colour: "#2b4c8c", candidacyIds: ["53"] },
  { id: "bng", name: "BNG", colour: "#76b3dd", candidacyIds: ["10"] },
  { id: "prc", name: "PRC", colour: "#8a7a0b", candidacyIds: ["88"] },
  { id: "teruel", name: "Teruel Existe", colour: "#037252", candidacyIds: ["108"] },
];
