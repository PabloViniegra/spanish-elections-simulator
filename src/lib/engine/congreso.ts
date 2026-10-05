import { allocateConstituency } from "./constituency";
import { AUTONOMOUS_CITY_CODES, AUTONOMOUS_CITY_SEATS, CONSTITUENCY_CODES, HOUSE_SIZE } from "./constants";
import type { ConstituencyVotes } from "./types";

// Allocates the whole Congreso, checking the 52 constituencies (R-01), the
// 350 seats (R-02) and the single seats of Ceuta and Melilla (R-09).
export function allocateCongreso(constituencies: readonly ConstituencyVotes[], lotSeed: string) {
  const codes = constituencies.map((constituency) => constituency.code).sort();
  if (codes.join() !== CONSTITUENCY_CODES.join()) {
    throw new RangeError("The Congreso needs exactly one entry per constituency, 01 to 52");
  }
  const totalSeats = constituencies.reduce((sum, constituency) => sum + constituency.seats, 0);
  if (totalSeats !== HOUSE_SIZE) {
    throw new RangeError(`Constituency seats add up to ${totalSeats}, not ${HOUSE_SIZE}`);
  }
  const wrongCity = constituencies.find(
    (constituency) => AUTONOMOUS_CITY_CODES.includes(constituency.code) && constituency.seats !== AUTONOMOUS_CITY_SEATS,
  );
  if (wrongCity) {
    throw new RangeError(`Constituency ${wrongCity.code} elects ${AUTONOMOUS_CITY_SEATS} deputy`);
  }

  return [...constituencies]
    .sort((a, b) => a.code.localeCompare(b.code))
    .map((constituency) => allocateConstituency(constituency, lotSeed));
}
