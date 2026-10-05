// LOREG arts. 161–162: the Congreso has 350 deputies elected in 52
// constituencies, the 50 provinces plus Ceuta and Melilla (R-01, R-02).
export const HOUSE_SIZE = 350;
export const MIN_PROVINCE_SEATS = 2;
export const AUTONOMOUS_CITY_SEATS = 1;
export const AUTONOMOUS_CITY_CODES = ["51", "52"];

export const CONSTITUENCY_CODES = Array.from({ length: 52 }, (_, index) =>
  String(index + 1).padStart(2, "0"),
);

export const PROVINCE_CODES = CONSTITUENCY_CODES.filter(
  (code) => !AUTONOMOUS_CITY_CODES.includes(code),
);
