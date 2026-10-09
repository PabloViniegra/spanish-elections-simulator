import { describe, expect, it } from "vitest";
import { bases } from "./bases";
import { loadBase } from "./load-base";

describe("loadBase", () => {
  it.each(bases)("loads only the requested base: $election.id", async (base) => {
    expect(await loadBase(base.election.id)).toEqual(base);
  });

  it("ignores unknown elections", async () => {
    expect(await loadBase("unknown")).toBeUndefined();
  });
});
