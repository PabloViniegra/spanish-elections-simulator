import type { Bloc, Election } from "@/lib/elections/types";
import { totalsByBloc } from "@/lib/engine/blocs";
import { allocateCongreso } from "@/lib/engine/congreso";
import { type BaseProvince, projectShares } from "@/lib/engine/project";
import { FULL_SHARE, type Scenario } from "./types";

export const BLANK = "blank";
export const OTHERS = "others";
// Basis points a bloc may miss its target by before the user is told.
const OFF_TARGET = 5;

// Base votes per province grouped by bloc, with every unmapped candidacy in
// "Others" (P-08).
export function baseByBloc(election: Election, blocs: readonly Bloc[]): BaseProvince[] {
  const blocOf = new Map(blocs.flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc.id])));
  return election.constituencies.map(({ code, blankVotes, results }) => {
    const votes = new Map<string, number>([...blocs.map((bloc): [string, number] => [bloc.id, 0]), [OTHERS, 0]]);
    votes.set(BLANK, blankVotes);
    results.forEach(({ candidacyId, votes: count }) => {
      const key = blocOf.get(candidacyId) ?? OTHERS;
      votes.set(key, (votes.get(key) ?? 0) + count);
    });
    return { code, votes };
  });
}

export function baseTurnout(election: Election) {
  const cast = election.constituencies.reduce(
    (sum, { blankVotes, nullVotes, results }) =>
      sum + blankVotes + nullVotes + results.reduce((total, { votes }) => total + votes, 0),
    0,
  );
  return cast / election.constituencies.reduce((sum, { census }) => sum + census, 0);
}

// The base election itself as a scenario, rounded to basis points.
export function baseScenario(election: Election, blocs: readonly Bloc[]): Scenario {
  const totals = new Map<string, number>();
  baseByBloc(election, blocs).forEach(({ votes }) =>
    votes.forEach((count, key) => totals.set(key, (totals.get(key) ?? 0) + count)),
  );
  const valid = [...totals.values()].reduce((sum, count) => sum + count, 0);
  const share = (key: string) => Math.round(((totals.get(key) ?? 0) / valid) * FULL_SHARE);
  return {
    schemaVersion: 1,
    baseElectionId: election.id,
    shares: Object.fromEntries(blocs.map((bloc) => [bloc.id, share(bloc.id)])),
    blank: share(BLANK),
    turnout: null,
  };
}

export function othersShare(scenario: Scenario) {
  return FULL_SHARE - scenario.blank - Object.values(scenario.shares).reduce((sum, share) => sum + share, 0);
}

// Projects the scenario over its base election (P-01 to P-06, P-08) and runs
// the seat engine with the given seat table. "Others" joins the blank votes:
// both count towards the 3% threshold and neither wins seats.
export function simulate(scenario: Scenario, election: Election, blocs: readonly Bloc[], seats: ReadonlyMap<string, number>) {
  const others = othersShare(scenario);
  if (others < 0) throw new RangeError("Bloc and blank shares add up to more than 100%");

  const base = baseByBloc(election, blocs);
  const shares = new Map([
    ...blocs.map((bloc): [string, number] => [bloc.id, (scenario.shares[bloc.id] ?? 0) / FULL_SHARE]),
    [BLANK, scenario.blank / FULL_SHARE],
    [OTHERS, others / FULL_SHARE],
  ]);
  const projection = projectShares(base, { shares });
  const turnoutRatio = scenario.turnout === null ? 1 : scenario.turnout / FULL_SHARE / baseTurnout(election);

  const constituencies = base.map(({ code, votes }) => {
    const validVotes = [...votes.values()].reduce((sum, count) => sum + count, 0) * turnoutRatio;
    const provinceShares = projection.provinces.get(code)!;
    const projected = (key: string) => Math.round(validVotes * (provinceShares.get(key) ?? 0));
    return {
      code,
      seats: seats.get(code) ?? 0,
      blankVotes: projected(BLANK) + projected(OTHERS),
      candidacies: blocs.map((bloc) => ({ id: bloc.id, votes: projected(bloc.id) })),
    };
  });
  const results = allocateCongreso(constituencies, election.id);
  const totals = totalsByBloc(results, new Map());

  // P-05: a regional bloc asked for more than its provinces hold pulls every
  // share away from its target; list the blocs that end up off, with the
  // shares requested and reached in basis points.
  const offTarget = projection.converged
    ? []
    : blocs.flatMap((bloc) => {
        const requested = scenario.shares[bloc.id] ?? 0;
        const reached = Math.round((projection.national.get(bloc.id) ?? 0) * FULL_SHARE);
        return Math.abs(reached - requested) > OFF_TARGET ? [{ blocId: bloc.id, requested, reached }] : [];
      });

  return {
    results,
    seats: new Map(blocs.map((bloc) => [bloc.id, totals.get(bloc.id)?.seats ?? 0])),
    offTarget,
  };
}
