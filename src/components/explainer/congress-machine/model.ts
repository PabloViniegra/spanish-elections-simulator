import election from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { allocateConstituency } from "@/lib/engine/constituency";
import { hemicycleSeats } from "@/lib/hemicycle-layout";
import { MAX_COLUMNS, NEUTRAL } from "./constants";

export type MachineColumn = { id: string; label: string; colour: string; votes: number; share: number; seats: number; excluded: boolean };
export type MachineAward = { column: number; divisor: number; share: number; quotient: number; slot: number };
export type ProvinceMachine = {
  code: string;
  name: string;
  seats: number;
  validVotes: number;
  columns: MachineColumn[];
  awards: MachineAward[];
  hidden: number;
};
export type CongressSeat = { colour: string; code: string };

const blocOf = new Map(blocs2023.flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc] as const)));
const acronymOf = new Map(election.candidacies.map(({ id, acronym }) => [id, acronym]));

function build() {
  const provinces: ProvinceMachine[] = [];
  const seats: CongressSeat[] = [];
  for (const constituency of [...election.constituencies].sort((a, b) => a.code.localeCompare(b.code))) {
    const result = allocateConstituency(
      {
        code: constituency.code,
        seats: constituency.seats,
        blankVotes: constituency.blankVotes,
        candidacies: constituency.results.map(({ candidacyId, votes }) => ({ id: candidacyId, votes })),
      },
      "2023-07",
    );
    // Every seat winner gets a column; leftover columns go to the next most voted.
    const shown = [...result.candidacies].sort((a, b) => b.seats - a.seats || b.votes - a.votes).slice(0, MAX_COLUMNS);
    const columns = shown.sort((a, b) => b.votes - a.votes).map(({ id, votes, seats: won, excluded }) => {
      const bloc = blocOf.get(id);
      return {
        id,
        label: bloc?.name ?? acronymOf.get(id) ?? id,
        colour: bloc?.colour ?? NEUTRAL,
        votes,
        share: votes / result.validVotes,
        seats: won,
        excluded,
      };
    });
    const index = new Map(columns.map((column, at) => [column.id, at]));
    const offsets = columns.map((_, at) => columns.slice(0, at).reduce((sum, column) => sum + column.seats, 0));
    const start = seats.length;
    const taken = columns.map(() => 0);
    const awards = result.awards.map(({ candidacyId, votes, divisor }) => {
      const column = index.get(candidacyId);
      if (column === undefined) throw new Error(`Seat in ${constituency.code} went to a hidden column`);
      const slot = start + offsets[column] + taken[column]++;
      return { column, divisor, share: votes / divisor / result.validVotes, quotient: Math.round(votes / divisor), slot };
    });
    columns.forEach((column) => seats.push(...Array.from({ length: column.seats }, () => ({ colour: column.colour, code: constituency.code }))));
    provinces.push({
      code: constituency.code,
      name: constituency.name,
      seats: constituency.seats,
      validVotes: result.validVotes,
      columns,
      awards,
      hidden: result.candidacies.length - columns.length,
    });
  }
  return { provinces, seats };
}

export const { provinces: PROVINCES, seats: CONGRESS } = build();

// Angle-ordered layout from the home hemicycle, reused so both read alike.
export const SEAT_LAYOUT = hemicycleSeats();
