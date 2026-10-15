import { describe, expect, it } from "vitest";
import election from "@/data/elections/2023-07.json";
import { MAX_COLUMNS } from "./constants";
import { CONGRESS, PROVINCES, SEAT_LAYOUT } from "./model";

describe("congress machine model", () => {
  it("covers every province and fills all 350 seats once", () => {
    expect(PROVINCES).toHaveLength(52);
    expect(CONGRESS).toHaveLength(350);
    expect(SEAT_LAYOUT).toHaveLength(350);
    const slots = PROVINCES.flatMap((province) => province.awards.map((award) => award.slot));
    expect(new Set(slots).size).toBe(350);
  });

  it("matches the official July 2023 seats per candidacy", () => {
    for (const province of PROVINCES) {
      const official = election.constituencies.find((constituency) => constituency.code === province.code);
      for (const column of province.columns) {
        expect(column.seats).toBe(official?.results.find((result) => result.candidacyId === column.id)?.elected);
      }
      expect(province.columns.length).toBeLessThanOrEqual(MAX_COLUMNS);
    }
  });

  it("hands out seats in falling quotient order", () => {
    for (const { awards } of PROVINCES) {
      awards.slice(1).forEach((award, index) => expect(award.share).toBeLessThanOrEqual(awards[index].share));
    }
  });
});
