import fc from "fast-check";
import { compressToEncodedURIComponent, decompressFromEncodedURIComponent } from "lz-string";
import { describe, expect, it } from "vitest";
import { decompressBounded } from "./decompress";

describe("decompressBounded", () => {
  it("matches lz-string on anything it compressed", () => {
    fc.assert(
      fc.property(fc.string({ unit: "binary", maxLength: 2000 }), (text) => {
        expect(decompressBounded(compressToEncodedURIComponent(text), Infinity)).toBe(text);
      }),
    );
  });

  it("matches lz-string on arbitrary input, or rejects it", () => {
    fc.assert(
      fc.property(fc.string({ maxLength: 200 }), (input) => {
        const bounded = decompressBounded(input, Infinity);
        if (bounded !== null) expect(bounded).toBe(decompressFromEncodedURIComponent(input));
      }),
    );
  });

  it("stops before building output beyond the limit", () => {
    const bomb = compressToEncodedURIComponent("a".repeat(1_000_000));
    expect(bomb.length).toBeLessThan(3000);
    expect(decompressBounded(bomb, 100_000)).toBeNull();
    expect(decompressBounded(bomb, 1_000_000)).toHaveLength(1_000_000);
  });

  it("rejects empty input like lz-string", () => {
    expect(decompressBounded("", 10)).toBeNull();
  });
});
