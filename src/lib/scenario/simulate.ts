import type { Bloc, Election } from "@/lib/elections/types";
import { totalsByBloc } from "@/lib/engine/blocs";
import { allocateCongreso } from "@/lib/engine/congreso";
import { type BaseProvince, projectShares } from "@/lib/engine/project";
import { FULL_SHARE, type ProvinceShares, type Scenario } from "./types";

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

// What the blocs and blank votes leave of 100%, nationally or in a province.
export function othersShare({ shares, blank }: ProvinceShares) {
  return FULL_SHARE - blank - Object.values(shares).reduce((sum, share) => sum + share, 0);
}

// True when the national shares and every locked province fit in 100%.
export function fitsInFull(scenario: Scenario) {
  return [scenario, ...Object.values(scenario.provinces ?? {})].every((shares) => othersShare(shares) >= 0);
}

// A projected province as basis points, largest remainders first so they add
// up to exactly 100%: the starting point when the user locks it (P-07).
export function provinceShares(projected: ReadonlyMap<string, number>, blocs: readonly Bloc[]): ProvinceShares {
  const keys = [...blocs.map((bloc) => bloc.id), BLANK, OTHERS];
  const exact = keys.map((key) => (projected.get(key) ?? 0) * FULL_SHARE);
  const rounded = exact.map(Math.floor);
  const order = keys.map((_, index) => index).sort((a, b) => exact[b] - rounded[b] - (exact[a] - rounded[a]));
  const missing = FULL_SHARE - rounded.reduce((sum, share) => sum + share, 0);
  order.slice(0, missing).forEach((index) => (rounded[index] += 1));
  return {
    shares: Object.fromEntries(blocs.map((bloc, index) => [bloc.id, rounded[index]])),
    blank: rounded[blocs.length],
  };
}

// Projects the scenario over its base election (P-01 to P-06, P-08) and runs
// the seat engine with the given seat table. "Others" joins the blank votes:
// both count towards the 3% threshold and neither wins seats.
export function simulate(scenario: Scenario, election: Election, blocs: readonly Bloc[], seats: ReadonlyMap<string, number>) {
  if (!fitsInFull(scenario)) throw new RangeError("Bloc and blank shares add up to more than 100%");

  const base = baseByBloc(election, blocs);
  const fractions = (input: ProvinceShares) =>
    new Map([
      ...blocs.map((bloc): [string, number] => [bloc.id, (input.shares[bloc.id] ?? 0) / FULL_SHARE]),
      [BLANK, input.blank / FULL_SHARE],
      [OTHERS, othersShare(input) / FULL_SHARE],
    ]);
  const locked = new Map(Object.entries(scenario.provinces ?? {}).map(([code, input]) => [code, fractions(input)]));
  const projection = projectShares(base, fractions(scenario), locked);
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

  // P-05, P-07: a regional bloc asked for more than its provinces hold, or
  // locked provinces that leave no room, pull shares away from their target;
  // list the blocs that end up off, with the shares requested and reached in
  // basis points.
  const offTarget = projection.converged
    ? []
    : blocs.flatMap((bloc) => {
        const requested = scenario.shares[bloc.id] ?? 0;
        const reached = Math.round((projection.national.get(bloc.id) ?? 0) * FULL_SHARE);
        return Math.abs(reached - requested) > OFF_TARGET ? [{ blocId: bloc.id, requested, reached }] : [];
      });

  return {
    results,
    // Projected share of each bloc, blank and "Others" by province code.
    provinces: projection.provinces,
    seats: new Map(blocs.map((bloc) => [bloc.id, totals.get(bloc.id)?.seats ?? 0])),
    offTarget,
  };
}

// Seats per bloc in one province of a simulation.
export function provinceSeats(results: ReturnType<typeof simulate>["results"], code: string) {
  const result = results.find((constituency) => constituency.code === code);
  return new Map(result?.candidacies.map(({ id, seats }) => [id, seats]));
}
