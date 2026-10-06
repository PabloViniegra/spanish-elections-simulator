import { othersShare } from "./simulate";
import { FULL_SHARE, type ProvinceShares } from "./types";

// Scales every bloc share by the same factor so the blocs, the blank vote and
// the given "others" share add up to exactly 100%. A fixed bloc keeps its share
// and the rest scale around it. Rounding leftovers go to the largest scaled
// bloc, where they weigh least. Works nationally and per province.
export function rebalance<T extends ProvinceShares>(scenario: T, others: number, fixed?: string): T {
  const fixedShare = fixed === undefined ? 0 : Math.min(scenario.shares[fixed] ?? 0, FULL_SHARE - scenario.blank);
  const entries = Object.entries(scenario.shares).filter(([id]) => id !== fixed);
  const total = entries.reduce((sum, [, share]) => sum + share, 0);
  const target = Math.max(0, FULL_SHARE - scenario.blank - others - fixedShare);
  if (total === 0) return scenario;

  const scaled = entries.map(([id, share]): [string, number] => [id, Math.floor((share * target) / total)]);
  const leftover = target - scaled.reduce((sum, [, share]) => sum + share, 0);
  const largest = scaled.reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  largest[1] += leftover;
  const shares = Object.fromEntries(scaled);
  if (fixed !== undefined) shares[fixed] = fixedShare;
  return { ...scenario, shares };
}

// Sets one bloc's share and scales the other blocs so "others" stays where it
// was in the base. Callers pass the same base for every step of one edit, so
// dragging back and forth never erodes the small blocs through rounding.
export function adjustShare<T extends ProvinceShares>(base: T, blocId: string, value: number): T {
  const others = Math.max(0, othersShare(base));
  return rebalance({ ...base, shares: { ...base.shares, [blocId]: value } }, others, blocId);
}

// Sets the blank vote and scales every bloc so "others" stays where it was.
export function adjustBlank<T extends ProvinceShares>(base: T, blank: number): T {
  const others = Math.max(0, othersShare(base));
  return rebalance({ ...base, blank: Math.min(blank, FULL_SHARE - others) }, others);
}
