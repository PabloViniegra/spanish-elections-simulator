import { FULL_SHARE, type ProvinceShares } from "./types";

// Scales every bloc share by the same factor so the blocs, the blank vote and
// the given "others" share add up to exactly 100%. Rounding leftovers go to the
// largest bloc, where they weigh least. Works nationally and per province.
export function rebalance<T extends ProvinceShares>(scenario: T, others: number): T {
  const entries = Object.entries(scenario.shares);
  const total = entries.reduce((sum, [, share]) => sum + share, 0);
  const target = Math.max(0, FULL_SHARE - scenario.blank - others);
  if (total === 0) return scenario;

  const scaled = entries.map(([id, share]): [string, number] => [id, Math.floor((share * target) / total)]);
  const leftover = target - scaled.reduce((sum, [, share]) => sum + share, 0);
  const largest = scaled.reduce((best, entry) => (entry[1] > best[1] ? entry : best));
  largest[1] += leftover;
  return { ...scenario, shares: Object.fromEntries(scaled) };
}
