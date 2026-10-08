import type { Base } from "@/lib/elections/bases";
import type { Bloc, ElectionConstituency } from "@/lib/elections/types";
import { othersShare } from "./simulate";
import { FULL_SHARE, type ProvinceShares, type Scenario } from "./types";

// FR-11: the user edits the blocs of the base election. The scenario carries
// the whole list once it differs from the default one, so a shared link keeps
// names, colours and the candidacy mapping. Capped so the coalition search
// (every subset of blocs with seats) stays instant.
export const MAX_BLOCS = 16;
export const BLOC_NAME_MAX = 24;
// Colours offered to new blocs, apart from those of the bundled parties.
const NEW_COLOURS = ["#6b2e68", "#da8b3a", "#037252", "#8a7a0b", "#18307b", "#eb6109"];
const FALLBACK_COLOUR = "#8e8e93";

export function scenarioBlocs(scenario: Scenario, base: Base): readonly Bloc[] {
  return scenario.blocs ?? base.blocs;
}

// Blocs with seats, largest first.
export function rankedBlocs(blocs: readonly Bloc[], seats: ReadonlyMap<string, number>) {
  return blocs
    .map((bloc) => ({ ...bloc, seats: seats.get(bloc.id) ?? 0 }))
    .filter((bloc) => bloc.seats > 0)
    .sort((a, b) => b.seats - a.seats);
}

// Drops the list when it is back to the default, so the link stays short.
function withBlocs(scenario: Scenario, base: Base, blocs: readonly Bloc[]): Scenario {
  const { blocs: _, ...rest } = scenario;
  return JSON.stringify(blocs) === JSON.stringify(base.blocs) ? rest : { ...rest, blocs: [...blocs] };
}

function editBloc(scenario: Scenario, base: Base, blocId: string, change: Partial<Bloc>) {
  return withBlocs(scenario, base, scenarioBlocs(scenario, base).map((bloc) => (bloc.id === blocId ? { ...bloc, ...change } : bloc)));
}

export const renameBloc = (scenario: Scenario, base: Base, blocId: string, name: string) => editBloc(scenario, base, blocId, { name });
export const recolourBloc = (scenario: Scenario, base: Base, blocId: string, colour: string) =>
  editBloc(scenario, base, blocId, { colour });

// A new bloc without base votes, so it starts with the same share everywhere
// (P-04); it begins at 0%.
export function addBloc(scenario: Scenario, base: Base): Scenario {
  const blocs = scenarioBlocs(scenario, base);
  if (blocs.length >= MAX_BLOCS) return scenario;
  const ids = new Set(blocs.map((bloc) => bloc.id));
  let index = 1;
  while (ids.has(`n${index}`)) index += 1;
  const colours = new Set(blocs.map((bloc) => bloc.colour));
  const bloc = {
    id: `n${index}`,
    name: index === 1 ? "Nuevo partido" : `Nuevo partido ${index}`,
    colour: NEW_COLOURS.find((colour) => !colours.has(colour)) ?? FALLBACK_COLOUR,
    candidacyIds: [],
  };
  return withBlocs({ ...scenario, shares: { ...scenario.shares, [bloc.id]: 0 } }, base, [...blocs, bloc]);
}

// The bloc's candidacies and share go to "Others" (P-08), nationally and in
// every locked province.
export function removeBloc(scenario: Scenario, base: Base, blocId: string): Scenario {
  const blocs = scenarioBlocs(scenario, base);
  if (blocs.length <= 1) return scenario;
  const without = <T extends ProvinceShares>(input: T): T => {
    const { [blocId]: _, ...shares } = input.shares;
    return { ...input, shares };
  };
  const provinces = scenario.provinces && Object.fromEntries(Object.entries(scenario.provinces).map(([code, province]) => [code, without(province)]));
  return withBlocs({ ...without(scenario), ...(provinces && { provinces }) }, base, blocs.filter((bloc) => bloc.id !== blocId));
}

// Moves a candidacy to another bloc, or to "Others" with `to` null. Its base
// share goes with it, nationally and in every locked province, as far as the
// bloc it leaves has share to give, so the scenario keeps fitting in 100%.
export function moveCandidacy(scenario: Scenario, base: Base, candidacyId: string, to: string | null): Scenario {
  const blocs = scenarioBlocs(scenario, base);
  const from = blocs.find((bloc) => bloc.candidacyIds.includes(candidacyId))?.id ?? null;
  if (from === to) return scenario;
  const moved = blocs.map((bloc) => {
    const candidacyIds = bloc.candidacyIds.filter((id) => id !== candidacyId);
    return { ...bloc, candidacyIds: bloc.id === to ? [...candidacyIds, candidacyId] : candidacyIds };
  });
  const constituencies = base.election.constituencies;
  const shift = <T extends ProvinceShares>(input: T, within: readonly ElectionConstituency[]): T => {
    const votes = sum(within.map(({ results }) => results.find((result) => result.candidacyId === candidacyId)?.votes ?? 0));
    const valid = sum(within.map(({ blankVotes, results }) => blankVotes + sum(results.map((result) => result.votes))));
    const available = from === null ? Math.max(0, othersShare(input)) : (input.shares[from] ?? 0);
    const amount = Math.min(available, valid > 0 ? Math.round((votes / valid) * FULL_SHARE) : 0);
    const shares = { ...input.shares };
    if (from !== null) shares[from] = available - amount;
    if (to !== null) shares[to] = (shares[to] ?? 0) + amount;
    return { ...input, shares };
  };
  const provinces =
    scenario.provinces &&
    Object.fromEntries(
      Object.entries(scenario.provinces).map(([code, province]) => [code, shift(province, constituencies.filter((constituency) => constituency.code === code))]),
    );
  return withBlocs({ ...shift(scenario, constituencies), ...(provinces && { provinces }) }, base, moved);
}

// Every candidacy of the base election with its national share of valid votes
// in basis points and the bloc it counts with (null for "Others"), largest
// first.
export function candidacyRows(scenario: Scenario, base: Base) {
  const blocOf = new Map(scenarioBlocs(scenario, base).flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc.id])));
  const votes = new Map<string, number>();
  let valid = 0;
  base.election.constituencies.forEach(({ blankVotes, results }) => {
    valid += blankVotes;
    results.forEach(({ candidacyId, votes: count }) => {
      valid += count;
      votes.set(candidacyId, (votes.get(candidacyId) ?? 0) + count);
    });
  });
  return base.election.candidacies
    .map(({ id, acronym, name }) => ({ id, acronym, name, share: ((votes.get(id) ?? 0) / valid) * FULL_SHARE, blocId: blocOf.get(id) ?? null }))
    .sort((a, b) => b.share - a.share);
}

function sum(values: readonly number[]) {
  return values.reduce((total, value) => total + value, 0);
}
