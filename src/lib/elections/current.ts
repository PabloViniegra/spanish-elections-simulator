import { seats2026 } from "@/lib/seats-2026";

// Keep the reference apportionment separate from the historical vote bases
// and the election engine, which accepts a seat table for any election.
export const currentElection = {
  label: "29 de noviembre de 2026",
  decree: "Real Decreto 806/2026",
  source: "https://www.boe.es/eli/es/rd/2026/10/05/806",
  seats: seats2026,
} as const;

export const simulationSeats = currentElection.seats;
