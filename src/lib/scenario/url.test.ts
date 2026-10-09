import fc from "fast-check";
import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { baseScenario } from "./simulate";
import type { Scenario } from "./types";
import { decodeScenario, encodeScenario, withScenarioParam } from "./url";

const base = baseScenario(election2023, blocs2023);
const codes = new Set(election2023.constituencies.map(({ code }) => code));
const candidacies = new Set(election2023.candidacies.map(({ id }) => id));
const link = (data: Omit<Scenario, "schemaVersion"> & { schemaVersion: number }) => `v1.${compressToEncodedURIComponent(JSON.stringify(data))}`;
// A v1 link (PP 35%, PSOE 29.74%) frozen when the format shipped (NFR-10).
const V1_FIXTURE =
  "v1.N4IgzgxgFgpgtgQwGowE5gJYHsB2IBcAjADQgBGCYMAogDYwQAu2OAkgCYEgBMADNwGYAtLwDsIUmCgJUMMAVAAHRQQEBWXr1KKwWGAW4BOUQBZSANywAPAoUEAOSQFdEqW4IGk0EW-cOkAKyccRnkiADYtcgxadidbAXDtHHNbO1IyHABzAnDuUggffBNRUidFPHxuQgBfDNoEHABrAnsSEEYnVBwsJ0YCHCdaWhqgA";

describe("scenario URL (FR-10)", () => {
  it("restores exactly the scenario it encodes (property)", () => {
    const blocIds = Object.keys(base.shares);
    const scenarios = fc
      .record({
        weights: fc.array(fc.integer({ min: 0, max: 1000 }), { minLength: blocIds.length + 1, maxLength: blocIds.length + 1 }),
        turnout: fc.option(fc.integer({ min: 0, max: 10_000 })),
      })
      .map(({ weights, turnout }) => {
        const total = Math.max(1, weights.reduce((sum, weight) => sum + weight, 0));
        const share = (weight: number) => Math.floor((weight / total) * 10_000);
        return {
          ...base,
          shares: Object.fromEntries(blocIds.map((id, index) => [id, share(weights[index])])),
          blank: share(weights[blocIds.length]),
          turnout,
        };
      });
    fc.assert(
      fc.property(scenarios, (scenario) => {
        expect(decodeScenario(encodeScenario(scenario), base, codes, candidacies)).toEqual(scenario);
      }),
    );
  });

  it("stays under 2,000 characters for a national scenario", () => {
    const busy = { ...base, shares: Object.fromEntries(Object.keys(base.shares).map((id) => [id, 777])), turnout: 7123 };
    expect(encodeScenario(busy).length).toBeLessThan(2000);
  });

  it("updates the scenario parameter in the share URL", () => {
    const current = "https://example.test/simulator?ref=mail&e=old&s=saved-id";
    const updated = withScenarioParam(current, "v1.new-scenario");
    expect(new URL(updated).searchParams.get("e")).toBe("v1.new-scenario");
    expect(new URL(updated).searchParams.get("ref")).toBe("mail");
    expect(new URL(updated).searchParams.has("s")).toBe(false);
    expect(new URL(withScenarioParam(updated, null)).searchParams.has("e")).toBe(false);
  });

  it("decodes links from every shipped schema version", () => {
    expect(decodeScenario(V1_FIXTURE, base, codes, candidacies)).toEqual({ ...base, shares: { ...base.shares, pp: 3500, psoe: 2974 } });
  });

  it("restores locked provinces", () => {
    const scenario = { ...base, provinces: { "28": { shares: { pp: 4500, psoe: 2500 }, blank: 80 } } };
    expect(decodeScenario(encodeScenario(scenario), base, codes, candidacies)).toEqual(scenario);
  });

  it("rejects locked provinces that do not fit", () => {
    const province = { shares: { pp: 4000 }, blank: 100 };
    expect(decodeScenario(link({ ...base, provinces: { "99": province } }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, provinces: { "28": { ...province, shares: { ciudadanos: 100 } } } }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, provinces: { "28": { ...province, shares: { pp: 9950 } } } }), base, codes, candidacies)).toBeNull();
  });

  it("restores edited blocs and rejects lists that do not fit the election (FR-11)", () => {
    const blocs = [...blocs2023.slice(0, -1), { id: "n1", name: "Nuevo", colour: "#123abc", candidacyIds: ["74"] }];
    const { upn: _, ...shares } = base.shares;
    const edited = { ...base, shares: { ...shares, n1: 50 }, blocs };
    expect(decodeScenario(encodeScenario(edited), base, codes, candidacies)).toEqual(edited);
    const reject = (changed: Partial<Scenario>) => expect(decodeScenario(link({ ...edited, ...changed }), base, codes, candidacies)).toBeNull();
    reject({ shares: { ...edited.shares, upn: 10 } });
    reject({ blocs: [...blocs, { ...blocs[0], candidacyIds: [] }] });
    reject({ blocs: [...blocs.slice(1), { ...blocs[0], id: "pp2" }, { id: "x", name: "X", colour: "#000000", candidacyIds: ["5"] }] });
    reject({ blocs: [...blocs, { id: "x", name: "X", colour: "#000000", candidacyIds: ["9999"] }] });
    reject({ blocs: [...blocs, { id: "x", name: " ", colour: "#000000", candidacyIds: [] }] });
    reject({ blocs: [...blocs, { id: "x", name: "X", colour: "red;", candidacyIds: [] }] });
  });

  it("rejects broken, unknown-version and mismatched links", () => {
    // A link that skips encodeScenario, so it can carry an unsupported version.
    expect(decodeScenario("garbage", base, codes, candidacies)).toBeNull();
    expect(decodeScenario("v1.%%%", base, codes, candidacies)).toBeNull();
    expect(decodeScenario(`v1.${compressToEncodedURIComponent("{not json")}`, base, codes, candidacies)).toBeNull();
    expect(decodeScenario(V1_FIXTURE.replace("v1.", "v2."), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, schemaVersion: 2 }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, baseElectionId: "2019-11" }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, ciudadanos: 100 } }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, constructor: 100 } }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, pp: 9000 } }), base, codes, candidacies)).toBeNull();
    expect(decodeScenario(link({ ...base, blank: 1.5 }), base, codes, candidacies)).toBeNull();
  });
});
