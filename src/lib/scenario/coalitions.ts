import { MAJORITY } from "@/lib/hemicycle-layout";

// FR-08: every combination of blocs that reaches the absolute majority and
// would lose it without any one of its members, largest first.
export function minimalWinningCoalitions(seats: ReadonlyMap<string, number>) {
  const blocs = [...seats].filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  const coalitions: { members: string[]; seats: number }[] = [];
  for (let mask = 1; mask < 1 << blocs.length; mask += 1) {
    const members = blocs.filter((_, index) => mask & (1 << index));
    const total = members.reduce((sum, [, count]) => sum + count, 0);
    // Members are sorted by seats, so dropping the smallest is the hardest test.
    if (total >= MAJORITY && total - members[members.length - 1][1] < MAJORITY) {
      coalitions.push({ members: members.map(([id]) => id), seats: total });
    }
  }
  return coalitions.sort((a, b) => a.members.length - b.members.length || b.seats - a.seats);
}
