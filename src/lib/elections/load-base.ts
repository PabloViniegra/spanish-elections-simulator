import type { Base } from "./bases";
import { baseOptions } from "./base-options";
import type { Bloc, Election } from "./types";

const loaders = {
  "2023-07": async () => {
    const [election, blocs] = await Promise.all([import("@/data/elections/2023-07.json"), import("./blocs-2023")]);
    return { election: election.default, blocs: blocs.blocs2023 };
  },
  "2019-11": async () => {
    const [election, blocs] = await Promise.all([import("@/data/elections/2019-11.json"), import("./blocs-2019-11")]);
    return { election: election.default, blocs: blocs.blocs2019Nov };
  },
  "2019-04": async () => {
    const [election, blocs] = await Promise.all([import("@/data/elections/2019-04.json"), import("./blocs-2019-04")]);
    return { election: election.default, blocs: blocs.blocs2019Apr };
  },
  "2016-06": async () => {
    const [election, blocs] = await Promise.all([import("@/data/elections/2016-06.json"), import("./blocs-2016")]);
    return { election: election.default, blocs: blocs.blocs2016 };
  },
} satisfies Record<(typeof baseOptions)[number]["id"], () => Promise<{ election: Election; blocs: readonly Bloc[] }>>;

export async function loadBase(id: string): Promise<Base | undefined> {
  const option = baseOptions.find((base) => base.id === id);
  if (!option) return undefined;
  return { ...await loaders[option.id](), label: option.label, short: option.short };
}
