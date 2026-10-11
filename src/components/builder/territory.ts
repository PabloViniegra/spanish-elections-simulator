import type { CatalogParty } from "@/lib/builder/types";

// "En 52 provincias, por última vez en 2023".
export function territory({ provinces, lastElection }: CatalogParty) {
  const where = provinces.length === 1 ? "En 1 provincia" : `En ${provinces.length} provincias`;
  return `${where}, por última vez en ${lastElection.slice(0, 4)}`;
}
