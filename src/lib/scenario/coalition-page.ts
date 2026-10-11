import { MAJORITY } from "@/lib/hemicycle-layout";

export type CoalitionPage = { rows: { members: string[]; seats: number }[]; total: number };
export type CoalitionRequest = { seats: [string, number][]; page: number; size: number };

// Stop at the first majority: adding another member could never be minimal.
// Two bounded-memory passes count rank buckets, then retain only one page.
export function winningCoalitionPage({ seats, page, size }: CoalitionRequest): CoalitionPage {
  const blocs = seats.filter(([, count]) => count > 0).sort((a, b) => b[1] - a[1]);
  const suffix = Array.from({ length: blocs.length + 1 }, () => 0);
  for (let i = blocs.length - 1; i >= 0; i--) suffix[i] = suffix[i + 1] + blocs[i][1];
  const width = suffix[0] + 1;
  const counts = new Uint32Array((blocs.length + 1) * width);
  const visit = (accept: (mask: number, count: number, total: number) => void) => {
    const walk = (index: number, mask: number, count: number, total: number) => {
      if (total + suffix[index] < MAJORITY) return;
      for (let i = index; i < blocs.length; i++) {
        const sum = total + blocs[i][1];
        const members = mask | (1 << i);
        if (sum >= MAJORITY) {
          if (sum - blocs[i][1] < MAJORITY) accept(members, count + 1, sum);
        } else {
          walk(i + 1, members, count + 1, sum);
        }
      }
    };
    walk(0, 0, 0, 0);
  };
  visit((_, count, total) => { counts[count * width + total]++; });

  const offsets = new Uint32Array(counts.length);
  let total = 0;
  for (let count = 1; count <= blocs.length; count++) {
    for (let sum = width - 1; sum >= MAJORITY; sum--) {
      const bucket = count * width + sum;
      offsets[bucket] = total;
      total += counts[bucket];
    }
  }
  const start = page * size;
  const end = Math.min(start + size, total);
  const rows: CoalitionPage["rows"] = [];
  if (end > start) {
    visit((mask, count, sum) => {
      const rank = offsets[count * width + sum]++;
      if (rank >= start && rank < end) {
        rows[rank - start] = { members: blocs.filter((_, i) => mask & (1 << i)).map(([id]) => id), seats: sum };
      }
    });
  }
  return { rows, total };
}
