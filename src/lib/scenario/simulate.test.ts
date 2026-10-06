import { describe, expect, it } from "vitest";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { seats2023 } from "@/lib/seats-2023";
import { seats2026 } from "@/lib/seats-2026";
import { baseScenario, baseTurnout, othersShare, simulate } from "./simulate";

const base = baseScenario(election2023, blocs2023);

describe("simulate", () => {
  it("starts from the 2023 national shares", () => {
    expect(base.shares.pp).toBe(3306);
    expect(base.shares.psoe).toBe(3168);
    expect(othersShare(base)).toBeGreaterThan(0);
  });

  it("gives back the official 2023 seats from the base scenario", () => {
    const { seats, offTarget } = simulate(base, election2023, blocs2023, seats2023);
    expect(offTarget).toEqual([]);
    expect(Object.fromEntries(seats)).toMatchObject({ pp: 137, psoe: 121, vox: 33, sumar: 31 });
  });

  it("uses the 2026 seat table and keeps 350 seats", () => {
    const { seats, results } = simulate(base, election2023, blocs2023, seats2026);
    expect([...seats.values()].reduce((sum, count) => sum + count, 0)).toBe(350);
    expect(results.find((result) => result.code === "28")?.seats).toBe(38);
  });

  it("moves seats when shares move and scales votes with turnout", () => {
    const shifted = { ...base, shares: { ...base.shares, pp: base.shares.pp + 300, psoe: base.shares.psoe - 300 } };
    const { seats } = simulate(shifted, election2023, blocs2023, seats2026);
    expect(seats.get("pp")).toBeGreaterThan(137);

    const turnout = Math.round(baseTurnout(election2023) * 10_000) + 1000;
    const higher = simulate({ ...base, turnout }, election2023, blocs2023, seats2026);
    const lower = simulate(base, election2023, blocs2023, seats2026);
    expect(higher.results[0].validVotes).toBeGreaterThan(lower.results[0].validVotes);
  });

  it("lists the blocs pulled off target when a regional bloc cannot reach its share", () => {
    const shares = { ...base.shares, pnv: 1500, pp: 2000 };
    const { offTarget } = simulate({ ...base, shares }, election2023, blocs2023, seats2026);
    const pnv = offTarget.find(({ blocId }) => blocId === "pnv");
    expect(pnv?.reached).toBeLessThan(1500);
    expect(offTarget.map(({ blocId }) => blocId)).toEqual(expect.arrayContaining(["pp", "psoe", "pnv"]));
  });

  it("rejects shares over 100%", () => {
    expect(() => simulate({ ...base, blank: 5000 }, election2023, blocs2023, seats2026)).toThrow(RangeError);
  });
});
