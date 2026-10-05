import type { ConstituencyResult } from "./types";

export type BlocTotals = { votes: number; seats: number };

// R-08: candidacies are local, so national totals group them through a
// candidacy → bloc mapping. A candidacy without a mapping is its own bloc.
export function totalsByBloc(results: readonly ConstituencyResult[], blocOf: ReadonlyMap<string, string>) {
  const totals = new Map<string, BlocTotals>();
  results.forEach((result) =>
    result.candidacies.forEach(({ id, votes, seats }) => {
      const bloc = blocOf.get(id) ?? id;
      const current = totals.get(bloc) ?? { votes: 0, seats: 0 };
      totals.set(bloc, { votes: current.votes + votes, seats: current.seats + seats });
    }),
  );
  return totals;
}
