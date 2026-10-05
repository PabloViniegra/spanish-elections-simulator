import {
  AUTONOMOUS_CITY_CODES,
  AUTONOMOUS_CITY_SEATS,
  HOUSE_SIZE,
  MIN_PROVINCE_SEATS,
  PROVINCE_CODES,
} from "./constants";

// R-03: Ceuta and Melilla get 1 seat each and every province a minimum of 2.
// The remaining seats follow the provinces' population with a Hare quota and
// largest remainders. Ceuta and Melilla's population is not part of the quota.
export function apportionSeats(population: ReadonlyMap<string, number>) {
  if (population.size !== PROVINCE_CODES.length || PROVINCE_CODES.some((code) => !population.has(code))) {
    throw new RangeError("Population must cover exactly the 50 provinces, without Ceuta and Melilla");
  }
  PROVINCE_CODES.forEach((code) => assertPositiveInteger(population.get(code) ?? 0, code));

  const fixedSeats = AUTONOMOUS_CITY_CODES.length * AUTONOMOUS_CITY_SEATS;
  const toDistribute = HOUSE_SIZE - fixedSeats - PROVINCE_CODES.length * MIN_PROVINCE_SEATS;
  const total = PROVINCE_CODES.reduce((sum, code) => sum + (population.get(code) ?? 0), 0);

  // pop / (total / toDistribute) as an integer quotient and remainder, so
  // remainders compare exactly.
  const shares = PROVINCE_CODES.map((code) => {
    const scaled = (population.get(code) ?? 0) * toDistribute;
    return { code, whole: Math.floor(scaled / total), remainder: scaled % total };
  });
  const leftover = toDistribute - shares.reduce((sum, share) => sum + share.whole, 0);

  // The law does not foresee equal remainders; INE code order keeps the
  // result deterministic if it ever happens.
  const extra = new Set(
    [...shares]
      .sort((a, b) => b.remainder - a.remainder || a.code.localeCompare(b.code))
      .slice(0, leftover)
      .map((share) => share.code),
  );

  const seats = new Map<string, number>();
  shares.forEach(({ code, whole }) => {
    seats.set(code, MIN_PROVINCE_SEATS + whole + (extra.has(code) ? 1 : 0));
  });
  AUTONOMOUS_CITY_CODES.forEach((code) => seats.set(code, AUTONOMOUS_CITY_SEATS));
  return seats;
}

function assertPositiveInteger(value: number, code: string) {
  if (!Number.isSafeInteger(value) || value <= 0) {
    throw new RangeError(`Population of ${code} must be a positive integer`);
  }
}
