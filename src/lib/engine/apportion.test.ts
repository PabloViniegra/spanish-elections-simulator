import fc from "fast-check";
import { describe, expect, it } from "vitest";
import { seats2023 } from "../seats-2023";
import { apportionSeats } from "./apportion";
import { HOUSE_SIZE, PROVINCE_CODES } from "./constants";
import { population2022 } from "./fixtures/population-2022";

describe("apportionSeats (R-01 to R-03)", () => {
  it("reproduces the 2023 seats from the official 2022 population", () => {
    expect(apportionSeats(population2022)).toEqual(seats2023);
  });

  it("gives Ceuta and Melilla one seat and every province at least two", () => {
    const populations = fc.array(fc.integer({ min: 1, max: 10_000_000 }), {
      minLength: PROVINCE_CODES.length,
      maxLength: PROVINCE_CODES.length,
    });
    fc.assert(
      fc.property(populations, (values) => {
        const seats = apportionSeats(new Map(PROVINCE_CODES.map((code, i) => [code, values[i]])));
        expect(seats.size).toBe(52);
        expect([...seats.values()].reduce((sum, value) => sum + value, 0)).toBe(HOUSE_SIZE);
        expect(seats.get("51")).toBe(1);
        expect(seats.get("52")).toBe(1);
        PROVINCE_CODES.forEach((code) => expect(seats.get(code)).toBeGreaterThanOrEqual(2));
      }),
    );
  });

  it("rejects a population table that misses a province or has bad figures", () => {
    const missing = new Map(population2022);
    missing.delete("28");
    expect(() => apportionSeats(missing)).toThrow(RangeError);
    expect(() => apportionSeats(new Map([...population2022, ["51", 83117]]))).toThrow(RangeError);
    expect(() => apportionSeats(new Map([...population2022, ["42", 0]]))).toThrow(RangeError);
  });
});
