import { describe, expect, it } from "vitest";
import election2016 from "@/data/elections/2016-06.json";
import election2019a from "@/data/elections/2019-04.json";
import election2019n from "@/data/elections/2019-11.json";
import election2023 from "@/data/elections/2023-07.json";
import { apportionSeats } from "@/lib/engine/apportion";
import { PROVINCE_CODES } from "@/lib/engine/constants";
import { officialSeatMismatches } from "./official-seats";
import type { Election } from "./types";

const elections: Election[] = [election2023, election2019n, election2019a, election2016];

describe.each(elections)("official results $id (NFR-01)", (election) => {
  it("reproduces the official seats in every constituency", () => {
    expect(officialSeatMismatches(election)).toEqual([]);
  });

  it("apportions the official seats from the official population (R-03)", () => {
    const population = new Map(
      election.constituencies
        .filter((constituency) => PROVINCE_CODES.includes(constituency.code))
        .map((constituency) => [constituency.code, constituency.population]),
    );
    const official = new Map(election.constituencies.map((constituency) => [constituency.code, constituency.seats]));
    expect(apportionSeats(population)).toEqual(official);
  });
});

describe("officialSeatMismatches", () => {
  it("reports a constituency whose official seats the engine does not reproduce", () => {
    const tampered = structuredClone(election2023);
    const madrid = tampered.constituencies.find((constituency) => constituency.code === "28");
    madrid?.results.forEach((result) => (result.elected = 0));
    expect(officialSeatMismatches(tampered)).toEqual(["28"]);
  });
});
