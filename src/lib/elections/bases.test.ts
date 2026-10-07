import { describe, expect, it } from "vitest";
import { totalsByBloc } from "@/lib/engine/blocs";
import { allocateCongreso } from "@/lib/engine/congreso";
import { baseById, bases, defaultBase } from "./bases";
import { constituencyVotes } from "./official-seats";

// Official seats of each national party, regional lists and coalitions included.
const officialSeats = {
  "2023-07": { pp: 137, psoe: 121, vox: 33, sumar: 31, erc: 7, junts: 7, bildu: 6, pnv: 5, bng: 1, cc: 1, upn: 1 },
  "2019-11": {
    psoe: 120,
    pp: 89,
    vox: 52,
    up: 35,
    erc: 13,
    cs: 10,
    junts: 8,
    pnv: 6,
    bildu: 5,
    "mas-pais": 3,
    cup: 2,
    cc: 2,
    na: 2,
    bng: 1,
    prc: 1,
    teruel: 1,
  },
  "2019-04": { psoe: 123, pp: 66, cs: 57, up: 42, vox: 24, erc: 15, junts: 7, pnv: 6, bildu: 4, cc: 2, na: 2, compromis: 1, prc: 1 },
  "2016-06": { pp: 137, psoe: 85, up: 71, cs: 32, erc: 9, cdc: 8, pnv: 5, bildu: 2, cc: 1, vox: 0 },
} satisfies Record<string, Record<string, number>>;

describe("bundled bases (FR-01, R-08)", () => {
  it("defaults to the most recent election", () => {
    expect(defaultBase.election.id).toBe("2023-07");
    expect(baseById("2019-04")?.election.id).toBe("2019-04");
    expect(baseById("1977-06")).toBeUndefined();
  });

  it("ships every election with official seats to check", () => {
    expect(bases.map((base) => base.election.id).sort()).toEqual(Object.keys(officialSeats).sort());
  });

  describe.each(Object.entries(officialSeats))("%s", (id, seatsByBloc) => {
    const { election, blocs } = baseById(id)!;
    const candidacyIds = blocs.flatMap((bloc) => bloc.candidacyIds);

    it("only groups candidacies that ran, each in one bloc", () => {
      const ran = new Set(election.candidacies.map((candidacy) => candidacy.id));
      expect(candidacyIds.filter((candidacyId) => !ran.has(candidacyId))).toEqual([]);
      expect(new Set(candidacyIds).size).toBe(candidacyIds.length);
    });

    it("adds up to the official seats of each national party", () => {
      const blocOf = new Map(blocs.flatMap((bloc) => bloc.candidacyIds.map((candidacyId) => [candidacyId, bloc.id])));
      const totals = totalsByBloc(allocateCongreso(constituencyVotes(election), election.id), blocOf);
      const seats = Object.fromEntries(blocs.map((bloc) => [bloc.id, totals.get(bloc.id)?.seats ?? 0]));
      expect(seats).toEqual(seatsByBloc);
    });
  });
});
