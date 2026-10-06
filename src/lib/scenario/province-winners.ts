import type { ConstituencyResult } from "@/lib/engine/types";

export type ProvinceOutcome = {
  // Blocs tied for the most seats, more votes first; empty when no bloc won a
  // seat. Two or more is a tie: seats decide, votes never break it.
  leaders: string[];
  // Blocs with seats, most first, more votes first on equal seats.
  seats: { id: string; seats: number }[];
};

// FR-07: which blocs take the most seats in each province, and how its seats
// split, by province code.
export function provinceWinners(results: readonly ConstituencyResult[]): Map<string, ProvinceOutcome> {
  return new Map(
    results.map(({ code, candidacies }) => {
      const ranked = candidacies.filter(({ seats }) => seats > 0).sort((a, b) => b.seats - a.seats || b.votes - a.votes);
      const top = ranked[0]?.seats;
      return [
        code,
        {
          leaders: ranked.filter(({ seats }) => seats === top).map(({ id }) => id),
          seats: ranked.map(({ id, seats }) => ({ id, seats })),
        },
      ];
    }),
  );
}
