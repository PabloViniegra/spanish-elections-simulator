import fc from "fast-check";
import { compressToEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import election2023 from "@/data/elections/2023-07.json";
import { blocs2023 } from "@/lib/elections/blocs-2023";
import { baseScenario } from "./simulate";
import type { Scenario } from "./types";
import { decodeScenario, encodeScenario } from "./url";

const base = baseScenario(election2023, blocs2023);
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
        expect(decodeScenario(encodeScenario(scenario), base)).toEqual(scenario);
      }),
    );
  });

  it("stays under 2,000 characters for a national scenario", () => {
    const busy = { ...base, shares: Object.fromEntries(Object.keys(base.shares).map((id) => [id, 777])), turnout: 7123 };
    expect(encodeScenario(busy).length).toBeLessThan(2000);
  });

  it("decodes links from every shipped schema version", () => {
    expect(decodeScenario(V1_FIXTURE, base)).toEqual({ ...base, shares: { ...base.shares, pp: 3500, psoe: 2974 } });
  });

  it("rejects broken, unknown-version and mismatched links", () => {
    // A link that skips encodeScenario, so it can carry an unsupported version.
    const link = (data: Omit<Scenario, "schemaVersion"> & { schemaVersion: number }) => `v1.${compressToEncodedURIComponent(JSON.stringify(data))}`;
    expect(decodeScenario("garbage", base)).toBeNull();
    expect(decodeScenario("v1.%%%", base)).toBeNull();
    expect(decodeScenario(`v1.${compressToEncodedURIComponent("{not json")}`, base)).toBeNull();
    expect(decodeScenario(V1_FIXTURE.replace("v1.", "v2."), base)).toBeNull();
    expect(decodeScenario(link({ ...base, schemaVersion: 2 }), base)).toBeNull();
    expect(decodeScenario(link({ ...base, baseElectionId: "2019-11" }), base)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, ciudadanos: 100 } }), base)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, constructor: 100 } }), base)).toBeNull();
    expect(decodeScenario(link({ ...base, shares: { ...base.shares, pp: 9000 } }), base)).toBeNull();
    expect(decodeScenario(link({ ...base, blank: 1.5 }), base)).toBeNull();
  });
});
