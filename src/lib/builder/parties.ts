import { MAX_PARTIES, PARTY_NAME_MAX } from "./schema";
import type { BuiltParty, CatalogParty } from "./types";

// Starting colours of invented parties, picked in turn; the user can change them.
const CUSTOM_COLOURS = ["#7c3aed", "#0891b2", "#c2410c", "#4d7c0f", "#be185d", "#475569"];

// Catalogue parties keep their acronym as the name the chamber shows.
export function addCatalogParty(parties: readonly BuiltParty[], party: CatalogParty): BuiltParty[] {
  if (parties.length >= MAX_PARTIES || parties.some(({ catalogId }) => catalogId === party.id)) return [...parties];
  return [...parties, { id: freeId(parties, party.id), name: party.acronym.slice(0, PARTY_NAME_MAX), colour: party.colour, catalogId: party.id }];
}

// An invented party, or the same list when the name is blank or there is no room.
export function addCustomParty(parties: readonly BuiltParty[], name: string): BuiltParty[] {
  const trimmed = name.trim().slice(0, PARTY_NAME_MAX);
  if (!trimmed || parties.length >= MAX_PARTIES) return [...parties];
  const custom = parties.filter(({ catalogId }) => !catalogId).length;
  return [...parties, { id: freeId(parties, "propio"), name: trimmed, colour: CUSTOM_COLOURS[custom % CUSTOM_COLOURS.length] }];
}

export function removeParty(parties: readonly BuiltParty[], id: string) {
  return parties.filter((party) => party.id !== id);
}

export function recolourParty(parties: readonly BuiltParty[], id: string, colour: string) {
  return parties.map((party) => (party.id === id ? { ...party, colour } : party));
}

// `base`, or `base-2`, `base-3`… when the list already uses it.
function freeId(parties: readonly BuiltParty[], base: string) {
  const used = new Set(parties.map(({ id }) => id));
  if (!used.has(base)) return base;
  let n = 2;
  while (used.has(`${base}-${n}`)) n++;
  return `${base}-${n}`;
}
