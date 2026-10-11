import { describe, expect, it } from "vitest";
import { winningCoalitionPage } from "./coalition-page";
import { minimalWinningCoalitions } from "./coalitions";

describe("bounded coalition pages", () => {
  it("returns all minimal coalitions, ranked by size and seats, across page boundaries", () => {
    const seats: [string, number][] = [["a", 90], ["b", 80], ["c", 70], ["d", 60], ["e", 50], ["f", 0]];
    const expected = minimalWinningCoalitions(new Map(seats));
    const actual = Array.from({ length: Math.ceil(expected.length / 2) }, (_, page) => {
      const result = winningCoalitionPage({ seats, page, size: 2 });
      expect(result.total).toBe(expected.length);
      return result.rows;
    }).flat();
    expect(actual).toHaveLength(expected.length);
    expect(actual).toEqual(expect.arrayContaining(expected));
    expect(actual.map(({ members, seats: sum }) => [members.length, sum])).toEqual(expected.map(({ members, seats: sum }) => [members.length, sum]));
  });

  it("counts millions of 24-party coalitions but retains only the requested page", () => {
    const seats: [string, number][] = Array.from({ length: 24 }, (_, i) => [`p${i}`, 14]);
    const result = winningCoalitionPage({ seats, page: 0, size: 50 });
    expect(result.total).toBe(2496144); // C(24, 13)
    expect(result.rows).toHaveLength(50);
    expect(result.rows.every(({ members, seats: sum }) => members.length === 13 && sum === 182)).toBe(true);
    const last = winningCoalitionPage({ seats, page: Math.floor(result.total / 50), size: 50 });
    expect(last.rows).toHaveLength(44);
    expect(last.rows.some((row) => row.members.join() === result.rows[0].members.join())).toBe(false);
  });

  it("handles no majority, a solo majority and pages past the end", () => {
    expect(winningCoalitionPage({ seats: [["a", 0]], page: 0, size: 50 })).toEqual({ rows: [], total: 0 });
    expect(winningCoalitionPage({ seats: [["a", 180], ["b", 170]], page: 0, size: 50 })).toEqual({ rows: [{ members: ["a"], seats: 180 }], total: 1 });
    expect(winningCoalitionPage({ seats: [["a", 180]], page: 1, size: 50 })).toEqual({ rows: [], total: 1 });
  });
});
