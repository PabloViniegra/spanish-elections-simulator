import election2016 from "@/data/elections/2016-06.json";
import election2019Apr from "@/data/elections/2019-04.json";
import election2019Nov from "@/data/elections/2019-11.json";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2016 } from "./blocs-2016";
import { blocs2019Apr } from "./blocs-2019-04";
import { blocs2019Nov } from "./blocs-2019-11";
import { blocs2023 } from "./blocs-2023";
import type { Bloc, Election } from "./types";

// FR-01: a bundled election with its default blocs, as a simulation base.
// `label` names it in a sentence ("los resultados de {label}"); `short` fits a
// column header.
export type Base = { election: Election; blocs: readonly Bloc[]; label: string; short: string };

// Most recent first; the first one is the default base.
export const bases: readonly Base[] = [
  { election: election2023, blocs: blocs2023, label: "julio de 2023", short: "2023" },
  { election: election2019Nov, blocs: blocs2019Nov, label: "noviembre de 2019", short: "nov. 2019" },
  { election: election2019Apr, blocs: blocs2019Apr, label: "abril de 2019", short: "abr. 2019" },
  { election: election2016, blocs: blocs2016, label: "junio de 2016", short: "2016" },
];

export const defaultBase = bases[0];

export function baseById(id: string) {
  return bases.find((base) => base.election.id === id);
}
