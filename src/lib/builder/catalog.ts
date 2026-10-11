import type { Bloc, Election, ElectionCandidacy } from "@/lib/elections/types";
import type { BuiltProvince, CatalogParty } from "./types";

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

type CatalogBase = { election: Election; blocs: readonly Bloc[] };

// The default bloc of every candidacy that has one.
function blocsOf(blocs: readonly Bloc[]) {
  return new Map(blocs.flatMap((bloc) => bloc.candidacyIds.map((id) => [id, bloc] as const)));
}

// The catalogue id of a candidacy: its default bloc, so a regional brand
// counts with its party (PSC with PSOE, EAJ-PNV as PNV), or else its acronym.
function idOf(candidacy: ElectionCandidacy, blocOf: ReadonlyMap<string, Bloc>) {
  return blocOf.get(candidacy.id)?.id ?? catalogId(candidacy.acronym);
}

// Every list that ran in the given elections, once per bloc or acronym, with
// the name and colour of its most recent run and every constituency it ever
// ran in. A bloc takes the full name of its most voted list. Most recent
// elections first, then by votes in that election.
export function buildCatalog(bases: readonly CatalogBase[]): CatalogParty[] {
  const recentFirst = [...bases].sort((a, b) => b.election.id.localeCompare(a.election.id));
  const parties = new Map<string, CatalogParty & { votes: number; top: number }>();

  recentFirst.forEach(({ election, blocs }) => {
    const blocOf = blocsOf(blocs);
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
      const bloc = blocOf.get(candidacy.id);
      const id = idOf(candidacy, blocOf);
      const run = runs.get(candidacy.id);
      if (!id || !run) return;
      const name = displayName(candidacy.name, candidacy.acronym);
      const known = parties.get(id);
      if (!known) {
        parties.set(id, {
          id,
          acronym: bloc?.name ?? candidacy.acronym.trim(),
          name,
          colour: bloc?.colour ?? NEUTRAL_COLOUR,
          provinces: [...run.provinces],
          lastElection: election.id,
          votes: run.votes,
          top: run.votes,
        });
        return;
      }
      known.provinces = [...new Set([...known.provinces, ...run.provinces])];
      if (known.lastElection === election.id) {
        known.votes += run.votes;
        if (run.votes > known.top) Object.assign(known, { name, top: run.votes });
      }
      if (known.colour === NEUTRAL_COLOUR) known.colour = bloc?.colour ?? NEUTRAL_COLOUR;
    });
  });

  return [...parties.values()]
    .sort((a, b) => b.lastElection.localeCompare(a.lastElection) || b.votes - a.votes)
    .map(({ votes: _votes, top: _top, ...party }) => ({ ...party, provinces: party.provinces.sort() }));
}

// The ids regional brands had before they joined their bloc, so elections
// saved with them still load: "psc" is now "psoe". The most recent bloc wins.
export function catalogAliases(bases: readonly CatalogBase[], catalog: readonly CatalogParty[]) {
  const ids = new Set(catalog.map(({ id }) => id));
  const aliases: Record<string, string> = {};
  [...bases]
    .sort((a, b) => b.election.id.localeCompare(a.election.id))
    .forEach(({ election, blocs }) => {
      const blocOf = blocsOf(blocs);
      election.candidacies.forEach((candidacy) => {
        const old = catalogId(candidacy.acronym);
        const bloc = blocOf.get(candidacy.id);
        if (bloc && old && !ids.has(old) && !(old in aliases)) aliases[old] = bloc.id;
      });
    });
  return aliases;
}

// Every province of one election with its votes by catalogue id, blank and
// null votes included: what the wizard offers to start from.
export function catalogResults({ election, blocs }: CatalogBase): Record<string, BuiltProvince> {
  const blocOf = blocsOf(blocs);
  const ids = new Map(election.candidacies.map((candidacy) => [candidacy.id, idOf(candidacy, blocOf)]));
  return Object.fromEntries(
    election.constituencies.map(({ code, results, blankVotes, nullVotes }) => {
      const votes: Record<string, number> = {};
      results.forEach(({ candidacyId, votes: count }) => {
        const id = ids.get(candidacyId);
        if (id) votes[id] = (votes[id] ?? 0) + count;
      });
      return [code, { votes, blank: blankVotes, null: nullVotes }];
    }),
  );
}
