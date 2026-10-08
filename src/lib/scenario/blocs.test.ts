import { describe, expect, it } from "vitest";
import { defaultBase } from "@/lib/elections/bases";
import { seats2026 } from "@/lib/seats-2026";
import { baselineFor, baselineOf } from "./baselines";
import { addBloc, candidacyRows, MAX_BLOCS, moveCandidacy, recolourBloc, removeBloc, renameBloc, scenarioBlocs } from "./blocs";
import { fitsInFull, simulate } from "./simulate";

const base = defaultBase;
const scenario = baselineOf(base).scenario;
// Coalición Canaria, its own bloc by default.
const CC = "31";

describe("bloc management (FR-11)", () => {
  it("renames and recolours a bloc, and drops the list once it is back to the default", () => {
    const renamed = recolourBloc(renameBloc(scenario, base, "vox", "VOX"), base, "vox", "#00ff00");
    expect(scenarioBlocs(renamed, base).find((bloc) => bloc.id === "vox")).toMatchObject({ name: "VOX", colour: "#00ff00" });
    const back = recolourBloc(renameBloc(renamed, base, "vox", "Vox"), base, "vox", "#63be21");
    expect(back).toEqual(scenario);
  });

  it("moves a candidacy with its base share, keeping the scenario in 100%", () => {
    const merged = moveCandidacy(scenario, base, CC, "pp");
    const blocs = scenarioBlocs(merged, base);
    expect(blocs.find((bloc) => bloc.id === "pp")!.candidacyIds).toContain(CC);
    expect(blocs.find((bloc) => bloc.id === "cc")!.candidacyIds).toEqual([]);
    expect(merged.shares.pp + merged.shares.cc).toBe(scenario.shares.pp + scenario.shares.cc);
    expect(merged.shares.cc).toBe(0);
    expect(fitsInFull(merged)).toBe(true);
  });

  it("recomputes national totals under the new mapping", () => {
    const merged = moveCandidacy(scenario, base, CC, "pp");
    const blocs = scenarioBlocs(merged, base);
    const { seats } = simulate(baselineFor(base, blocs).scenario, base.election, blocs, seats2026);
    const before = baselineOf(base).simulation.seats;
    expect(seats.get("cc")).toBe(0);
    expect(seats.get("pp")).toBeGreaterThanOrEqual(before.get("pp")!);
  });

  it("moves a candidacy to and from Others", () => {
    const others = moveCandidacy(scenario, base, CC, null);
    expect(others.shares.cc).toBe(0);
    expect(candidacyRows(others, base).find((row) => row.id === CC)!.blocId).toBeNull();
    const back = moveCandidacy(others, base, CC, "cc");
    expect(back.shares.cc).toBe(scenario.shares.cc);
    expect(back).toEqual(scenario);
  });

  it("shifts shares in locked provinces too", () => {
    const locked = { ...scenario, provinces: { "35": { shares: { pp: 3000, psoe: 2500, cc: 1500 }, blank: 100 } } };
    const merged = moveCandidacy(locked, base, CC, "psoe");
    const { psoe, cc } = merged.provinces!["35"].shares;
    expect(psoe).toBeGreaterThan(2500);
    expect(psoe + cc).toBe(4000);
  });

  it("adds new blocs at 0% up to the cap, and removes them to Others", () => {
    const added = addBloc(scenario, base);
    const bloc = scenarioBlocs(added, base).at(-1)!;
    expect(bloc).toMatchObject({ id: "n1", name: "Nuevo partido", candidacyIds: [] });
    expect(added.shares.n1).toBe(0);
    expect(addBloc(added, base).shares).toHaveProperty("n2");

    let full = scenario;
    for (let index = 0; index < MAX_BLOCS + 2; index += 1) full = addBloc(full, base);
    expect(scenarioBlocs(full, base)).toHaveLength(MAX_BLOCS);

    expect(removeBloc(added, base, "n1")).toEqual(scenario);
  });

  it("gives a removed bloc's candidacies and share to Others", () => {
    const removed = removeBloc(scenario, base, "cc");
    expect(removed.shares).not.toHaveProperty("cc");
    expect(candidacyRows(removed, base).find((row) => row.id === CC)!.blocId).toBeNull();
    expect(simulate(removed, base.election, scenarioBlocs(removed, base), seats2026).seats.has("cc")).toBe(false);
  });
});
