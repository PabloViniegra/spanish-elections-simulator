import { describe, expect, it } from "vitest";
import { totalsByBloc } from "./blocs";
import { allocateConstituency } from "./constituency";

describe("totalsByBloc (R-08)", () => {
  it("groups local candidacies into national blocs and keeps unmapped ones apart", () => {
    const results = [
      allocateConstituency(
        { code: "08", seats: 4, blankVotes: 0, candidacies: [{ id: "PSC-PSOE", votes: 300 }, { id: "PP", votes: 100 }] },
        "seed",
      ),
      allocateConstituency(
        { code: "28", seats: 4, blankVotes: 0, candidacies: [{ id: "PSOE", votes: 100 }, { id: "PP", votes: 300 }] },
        "seed",
      ),
    ];
    const totals = totalsByBloc(results, new Map([["PSC-PSOE", "PSOE"]]));
    expect(totals).toEqual(
      new Map([
        ["PSOE", { votes: 400, seats: 4 }],
        ["PP", { votes: 400, seats: 4 }],
      ]),
    );
  });
});
