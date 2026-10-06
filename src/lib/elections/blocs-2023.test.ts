import { describe, expect, it } from "vitest";
import election2023 from "@/data/elections/2023-07.json";
import { totalsByBloc } from "@/lib/engine/blocs";
import { allocateCongreso } from "@/lib/engine/congreso";
import { blocs2023 } from "./blocs-2023";
import { constituencyVotes } from "./official-seats";

const candidacyIds = blocs2023.flatMap((bloc) => bloc.candidacyIds);

describe("blocs2023 (R-08)", () => {
  it("only groups candidacies that ran in 2023, each in one bloc", () => {
    const ran = new Set(election2023.candidacies.map((candidacy) => candidacy.id));
    expect(candidacyIds.filter((id) => !ran.has(id))).toEqual([]);
    expect(new Set(candidacyIds).size).toBe(candidacyIds.length);
  });

  it("adds up to the official seats of each national party", () => {
    const blocOf = new Map(blocs2023.flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc.id])));
    const totals = totalsByBloc(allocateCongreso(constituencyVotes(election2023), election2023.id), blocOf);
    const seats = Object.fromEntries(blocs2023.map((bloc) => [bloc.id, totals.get(bloc.id)?.seats]));
    expect(seats).toEqual({
      pp: 137,
      psoe: 121,
      vox: 33,
      sumar: 31,
      erc: 7,
      junts: 7,
      bildu: 6,
      pnv: 5,
      bng: 1,
      cc: 1,
      upn: 1,
    });
  });
});
