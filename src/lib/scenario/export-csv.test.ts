import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { baselineOf } from "./baselines";
import { resultsCsv } from "./export-csv";

describe("resultsCsv (FR-13)", () => {
  it("exports one row per province and bloc, including zero votes", () => {
    const { simulation } = baselineOf(defaultBase);
    const csv = resultsCsv(simulation.results, defaultBase.blocs);
    const rows = csv.slice(1).trim().split("\r\n");
    expect(csv.startsWith("\uFEFF")).toBe(true);
    expect(rows).toHaveLength(1 + 52 * defaultBase.blocs.length);
    const cells = rows.slice(1).map((row) => row.split(","));
    expect(cells.reduce((sum, row) => sum + Number(row[6]), 0)).toBe(350);
    expect(cells.some((row) => row[4] === "0")).toBe(true);
    const madrid = simulation.results.find(({ code }) => code === "28")!;
    const pp = madrid.candidacies.find(({ id }) => id === "pp")!;
    expect(csv).toContain(`"28","Madrid","pp","PP",${pp.votes},${(pp.votes / madrid.validVotes * 100).toFixed(6)},${pp.seats}`);
  });

  it("uses valid votes, including blank and Others, as the denominator", () => {
    const bloc = { id: "a", name: "A", colour: "#000000", candidacyIds: [] };
    const csv = resultsCsv([{ code: "28", seats: 1, validVotes: 200, candidacies: [{ id: "a", votes: 100, seats: 1, excluded: false }], awards: [], vacantSeats: 0 }], [bloc]);
    expect(csv).toContain(',100,50.000000,1');
  });

  it("escapes CSV text and prevents spreadsheet formulas", () => {
    const bloc = { id: "a", name: '=A,"B"\nC', colour: "#000000", candidacyIds: [] };
    const csv = resultsCsv([{ code: "28", seats: 1, validVotes: 0, candidacies: [], awards: [], vacantSeats: 1 }], [bloc]);
    expect(csv).toContain('"\'=A,""B""\nC",0,0.000000,0');
    expect(csv).not.toContain("NaN");
  });
});
