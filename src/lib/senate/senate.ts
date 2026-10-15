import data from "@/data/senate/2023-07.json";
import type { SenateConstituency, SenateElection } from "./types";

export const senate2023: SenateElection = data;
export const ELECTED_SENATORS = senate2023.constituencies.reduce((sum, constituency) => sum + constituency.seats, 0);

// CE art. 69.5: senators appointed by each regional parliament in the XV
// legislature. LOREG 165.4 fixes the count with the population at the last
// general election, so it only changes after the next one.
export const designated = [
  { name: "Andalucía", seats: 9 },
  { name: "Cataluña", seats: 8 },
  { name: "Comunidad de Madrid", seats: 7 },
  { name: "Comunitat Valenciana", seats: 6 },
  { name: "Canarias", seats: 3 },
  { name: "Castilla y León", seats: 3 },
  { name: "Castilla-La Mancha", seats: 3 },
  { name: "Galicia", seats: 3 },
  { name: "País Vasco", seats: 3 },
  { name: "Aragón", seats: 2 },
  { name: "Asturias", seats: 2 },
  { name: "Extremadura", seats: 2 },
  { name: "Illes Balears", seats: 2 },
  { name: "Región de Murcia", seats: 2 },
  { name: "Cantabria", seats: 1 },
  { name: "La Rioja", seats: 1 },
  { name: "Navarra", seats: 1 },
];
export const DESIGNATED_SENATORS = designated.reduce((sum, community) => sum + community.seats, 0);
export const TOTAL_SENATORS = ELECTED_SENATORS + DESIGNATED_SENATORS;

export function designatedFor(population: number) {
  return 1 + Math.floor(population / 1_000_000);
}

// LOREG art. 166.1.a: three marks in a province, two in Gran Canaria,
// Mallorca, Tenerife, Ceuta and Melilla, one in the other islands.
export function marksAllowed(seats: number) {
  if (seats === 4) return 3;
  return seats >= 2 ? 2 : 1;
}

export function partySeats({ candidates }: SenateConstituency) {
  const split = new Map<string, number>();
  for (const { party, elected } of candidates) if (elected) split.set(party, (split.get(party) ?? 0) + 1);
  return [...split].sort((a, b) => b[1] - a[1]);
}

export function seatSplit(item: SenateConstituency) {
  return partySeats(item).map(([, seats]) => seats);
}

export function constituency(code: string) {
  const found = senate2023.constituencies.find((item) => item.code === code);
  if (!found) throw new Error(`Unknown Senate constituency ${code}`);
  return found;
}
