import type { Bloc, Election } from "@/lib/elections/types";
import type { CatalogParty } from "./types";

// Colour of a list no default bloc names.
export const NEUTRAL_COLOUR = "#8c8c8c";

// The catalogue id of an acronym: "Junts" and "JUNTS", or "U.P.N." and
// "UPN", are the same party.
export function catalogId(acronym: string) {
  return acronym
    .replaceAll(".", "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 40);
}

// Words kept in lower case inside a name, unless they open it.
const PARTICLES = new Set(["a", "al", "con", "da", "das", "de", "del", "dels", "do", "dos", "e", "el", "els", "en", "i", "la", "las", "les", "los", "o", "para", "per", "por", "y"]);

// The official name, in capitals, as a reader would write it: "PARTIT DELS
// SOCIALISTES DE CATALUNYA (PSC-PSOE)" becomes "Partit dels Socialistes de
// Catalunya (PSC-PSOE)". Short acronyms of the party stay in capitals, and so
// does anything in brackets or with dots.
export function displayName(name: string, acronym: string) {
  const trimmed = name.trim();
  const acronyms = new Set(
    acronym
      .toUpperCase()
      .split(/[^\p{L}]+/u)
      .filter((token) => token.length > 0 && token.length <= 4 && !PARTICLES.has(token.toLocaleLowerCase("es"))),
  );
  const onlyAcronym = trimmed.toUpperCase() === acronym.trim().toUpperCase();
  // A hyphen opens a new name, as in "Candidatura d'Unitat Popular-Per la Ruptura".
  let first = true;
  return trimmed
    .split(/(\s+|-)/)
    .map((part) => {
      if (part === "-") first = true;
      if (!/\p{L}/u.test(part)) return part;
      const opens = first;
      first = false;
      if (/[().]/.test(part) || (!onlyAcronym && acronyms.has(part.toUpperCase()))) return part;
      const lower = part.toLocaleLowerCase("es");
      if (!opens && PARTICLES.has(lower)) return lower;
      const elided = /^([dl]')(.+)$/u.exec(lower);
      return elided ? elided[1] + capitalise(elided[2]) : capitalise(lower);
    })
    .join("");
}

function capitalise(word: string) {
  return word.replace(/\p{L}/u, (letter) => letter.toLocaleUpperCase("es"));
}

// Every list that ran in the given elections, once per acronym, with the name
// and colour of its most recent run and every constituency it ever ran in.
// Most recent elections first, then by votes in that election.
export function buildCatalog(bases: readonly { election: Election; blocs: readonly Bloc[] }[]): CatalogParty[] {
  const recentFirst = [...bases].sort((a, b) => b.election.id.localeCompare(a.election.id));
  const parties = new Map<string, CatalogParty & { votes: number }>();

  recentFirst.forEach(({ election, blocs }) => {
    const colourOf = new Map(blocs.flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc.colour])));
    const runs = new Map<string, { provinces: Set<string>; votes: number }>();
    election.constituencies.forEach(({ code, results }) =>
      results.forEach(({ candidacyId, votes }) => {
        const run = runs.get(candidacyId) ?? { provinces: new Set<string>(), votes: 0 };
        run.provinces.add(code);
        run.votes += votes;
        runs.set(candidacyId, run);
      }),
    );

    election.candidacies.forEach((candidacy) => {
      const id = catalogId(candidacy.acronym);
      const run = runs.get(candidacy.id);
      if (!id || !run) return;
      const known = parties.get(id);
      if (!known) {
        parties.set(id, {
          id,
          acronym: candidacy.acronym.trim(),
          name: displayName(candidacy.name, candidacy.acronym),
          colour: colourOf.get(candidacy.id) ?? NEUTRAL_COLOUR,
          provinces: [...run.provinces],
          lastElection: election.id,
          votes: run.votes,
        });
        return;
      }
      known.provinces = [...new Set([...known.provinces, ...run.provinces])];
      if (known.lastElection === election.id) known.votes += run.votes;
      if (known.colour === NEUTRAL_COLOUR) known.colour = colourOf.get(candidacy.id) ?? NEUTRAL_COLOUR;
    });
  });

  return [...parties.values()]
    .sort((a, b) => b.lastElection.localeCompare(a.lastElection) || b.votes - a.votes)
    .map(({ votes: _votes, ...party }) => ({ ...party, provinces: party.provinces.sort() }));
}
