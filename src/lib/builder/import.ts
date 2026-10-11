import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { provinces as provinceNames } from "@/lib/provinces";
import { type BuilderReference, castVotes } from "./allocate";
import { parseCsv, toCsv } from "./csv";
import { addCatalogParty } from "./parties";
import { MAX_PARTIES, MAX_VOTES } from "./schema";
import type { BuiltParty, BuiltProvince, BuiltScenario, CatalogParty } from "./types";

// Fixed columns of the import file; the parties of the list go between
// `provincia` and `blancos`.
export const COLUMNS = { code: "codigo_ine", name: "provincia", blank: "blancos", null: "nulos", cast: "votos_emitidos" } as const;
// Far above 52 rows of 24 parties, so only a wrong file reaches it.
export const IMPORT_MAX_BYTES = 256_000;

// One reason the file cannot be imported. `line` is the line of the file,
// as a spreadsheet numbers its rows: the header is line 1.
export type ImportIssue = { line?: number; province?: string; column?: string; message: string };

export type ImportResult = { ok: true; provinces: Record<string, BuiltProvince> } | { ok: false; issues: ImportIssue[] };
export type NewImportResult = { ok: true; parties: BuiltParty[]; provinces: Record<string, BuiltProvince> } | { ok: false; issues: ImportIssue[] };

const nameOf = new Map(provinceNames.map(({ code, name }) => [code, name]));
const partyColumn = ({ name }: BuiltParty) => name.trim().normalize("NFC");

function header(parties: readonly BuiltParty[]) {
  return [COLUMNS.code, COLUMNS.name, ...parties.map(partyColumn), COLUMNS.blank, COLUMNS.null, COLUMNS.cast];
}

// Names that more than one column would take, so no file could tell them apart.
export function clashingNames(parties: readonly BuiltParty[]) {
  const names = header(parties);
  return [...new Set(names.filter((name, index) => names.indexOf(name) !== index))];
}

// The 52 constituencies with a column per party of the list, holding the
// votes typed so far: blank where a party does not run or a province is not
// started. Separated by semicolons, as a Spanish spreadsheet expects, with a
// byte order mark so it opens as UTF-8.
export function csvTemplate(scenario: BuiltScenario) {
  const rows = CONSTITUENCY_CODES.map((code) => {
    const province = scenario.provinces[code];
    const count = (votes: number | undefined) => (province && votes !== undefined ? String(votes) : "");
    return [
      code,
      nameOf.get(code) ?? code,
      ...scenario.parties.map(({ id }) => count(province?.votes[id])),
      count(province?.blank),
      count(province?.null),
      count(province && castVotes(province)),
    ];
  });
  return "\uFEFF" + toCsv([header(scenario.parties), ...rows], ";");
}

// The empty template of a new election, with a column per party given.
export function newCsvTemplate(parties: readonly CatalogParty[]) {
  return csvTemplate({ schemaVersion: 1, seatTable: "2026", parties: parties.reduce<BuiltParty[]>(addCatalogParty, []), provinces: {} });
}

// The text without its byte order mark and the separator that follows the
// first column name, or why the file cannot be read at all.
function opening(text: string): { body: string; separator: string } | { issue: ImportIssue } {
  const body = text.replace(/^\uFEFF/, "").normalize("NFC");
  if (body.trim() === "") return { issue: { message: "El archivo está vacío." } };
  const separator = body.startsWith(`${COLUMNS.code};`) ? ";" : body.startsWith(`${COLUMNS.code},`) ? "," : null;
  return separator ? { body, separator } : { issue: { message: `La primera columna debe llamarse ${COLUMNS.code}, y las columnas deben separarse con «;» o «,».` } };
}

// A whole number of votes, digits only, or why it is not.
function readCount(cell: string): { count: number } | { problem: string } {
  if (!/^\d+$/.test(cell)) return { problem: `«${cell}» no es un número entero; escribe solo cifras, sin puntos, comas ni espacios.` };
  const count = Number(cell);
  return count > MAX_VOTES ? { problem: `${cell} supera el máximo de ${MAX_VOTES} votos.` } : { count };
}

function checkHeader(columns: readonly string[], expected: readonly string[]): ImportIssue[] {
  const issues: ImportIssue[] = [];
  columns.forEach((column, index) => {
    if (column === "") issues.push({ line: 1, message: `La columna ${index + 1} no tiene nombre.` });
    else if (columns.indexOf(column) !== index) issues.push({ line: 1, column, message: "La columna está repetida." });
    else if (!expected.includes(column)) issues.push({ line: 1, column, message: "No es ningún partido de tu lista ni una columna de la plantilla." });
  });
  expected.filter((column) => !columns.includes(column)).forEach((column) => issues.push({ line: 1, column, message: "Falta esta columna." }));
  return issues;
}

// Every constituency of the file, or every reason it cannot replace the
// votes of the scenario. Nothing is guessed: a file with one issue imports
// nothing.
export function importCsv(text: string, scenario: BuiltScenario, reference: BuilderReference, censusYear: string): ImportResult {
  const opened = opening(text);
  if ("issue" in opened) return { ok: false, issues: [opened.issue] };
  const { body, separator } = opened;
  const clashes = clashingNames(scenario.parties);
  if (clashes.length > 0) return { ok: false, issues: [{ message: `Más de una columna se llamaría ${clashes.map((name) => `«${name}»`).join(", ")}. Quita uno de esos partidos de tu lista para poder importar.` }] };

  const { records, unclosed } = parseCsv(body, separator);
  if (unclosed) return { ok: false, issues: [{ line: unclosed, message: "Unas comillas se abren y no se cierran." }] };
  const [head, ...rows] = records;
  const columns = head.fields.map((field) => field.trim());
  const headerIssues = checkHeader(columns, header(scenario.parties));
  if (headerIssues.length > 0) return { ok: false, issues: headerIssues };

  const issues: ImportIssue[] = [];
  const imported: Record<string, BuiltProvince> = {};
  const seenOn = new Map<string, number>();
  const at = (column: string) => columns.indexOf(column);

  rows.forEach(({ fields, line }) => {
    const cells = fields.map((field) => field.trim());
    if (cells.every((cell) => cell === "")) return;
    const code = cells[at(COLUMNS.code)] ?? "";
    const name = nameOf.get(code);
    if (!name) {
      issues.push({ line, column: COLUMNS.code, message: `«${code}» no es el código INE de ninguna circunscripción; usa dos cifras, de 01 a 52.` });
      return;
    }
    const issue = (message: string, column?: string) => issues.push({ line, province: name, column, message });
    const earlier = seenOn.get(code);
    if (earlier) {
      issue(`La provincia ya aparece en la fila ${earlier}.`, COLUMNS.code);
      return;
    }
    seenOn.set(code, line);
    if (cells.length !== columns.length) {
      issue(`Tiene ${cells.length} columnas y la cabecera ${columns.length}.`);
      return;
    }
    if (cells[at(COLUMNS.name)] !== name) issue(`«${cells[at(COLUMNS.name)]}» no coincide con el código ${code}; debe ser «${name}».`, COLUMNS.name);

    const province: BuiltProvince = { votes: {}, blank: 0, null: 0 };
    let readable = true;
    const read = (column: string, required: boolean) => {
      const cell = cells[at(column)];
      if (cell === "") {
        if (required) {
          issue("No puede estar vacía.", column);
          readable = false;
        }
        return undefined;
      }
      const parsed = readCount(cell);
      if ("count" in parsed) return parsed.count;
      issue(parsed.problem, column);
      readable = false;
      return undefined;
    };

    scenario.parties.forEach((party) => {
      const { id, catalogId } = party;
      const votes = read(partyColumn(party), false);
      if (votes === undefined) return;
      if (catalogId && !reference.catalog.get(catalogId)?.provinces.includes(code)) {
        issue("Este partido nunca se ha presentado aquí; deja la celda vacía.", partyColumn(party));
        readable = false;
      }
      province.votes[id] = votes;
    });
    province.blank = read(COLUMNS.blank, true) ?? 0;
    province.null = read(COLUMNS.null, true) ?? 0;
    const cast = read(COLUMNS.cast, true);
    if (!readable || cast === undefined) return;

    const sum = castVotes(province);
    const census = reference.census.get(code) ?? 0;
    if (cast !== sum) issue(`Indica ${cast}, pero partidos, blancos y nulos suman ${sum}.`, COLUMNS.cast);
    else if (cast > census) issue(`${cast} supera el censo de ${censusYear}, que es de ${census}.`, COLUMNS.cast);
    if (!Object.values(province.votes).some((votes) => votes > 0)) issue("Ningún partido tiene votos.");
    imported[code] = province;
  });

  CONSTITUENCY_CODES.filter((code) => !seenOn.has(code)).forEach((code) => issues.push({ province: nameOf.get(code), message: "Falta esta provincia." }));
  return issues.length > 0 ? { ok: false, issues } : { ok: true, provinces: imported };
}

// A new election from a file alone: each party column must be the exact
// acronym of a catalogue party, which joins the list in the order of the
// columns. The rows are then checked as for any list.
export function importNewCsv(text: string, catalog: readonly CatalogParty[], reference: BuilderReference, censusYear: string): NewImportResult {
  const opened = opening(text);
  if ("issue" in opened) return { ok: false, issues: [opened.issue] };
  const { body, separator } = opened;

  const fixed: readonly string[] = Object.values(COLUMNS);
  const columns = (parseCsv(body, separator).records[0]?.fields ?? []).map((field) => field.trim());
  const named = [...new Set(columns.filter((column) => column !== "" && !fixed.includes(column)))];
  const byAcronym = new Map(catalog.map((party) => [party.acronym.trim(), party]));
  const issues: ImportIssue[] = named
    .filter((column) => !byAcronym.has(column))
    .map((column) => ({ line: 1, column, message: "No es la sigla exacta de ningún partido del catálogo; consúltala en el buscador de «Elegir partidos y escribir los votos»." }));
  if (named.length === 0) issues.push({ line: 1, message: "Añade al menos una columna de partido." });
  if (named.length > MAX_PARTIES) issues.push({ line: 1, message: `Hay ${named.length} partidos; el máximo es ${MAX_PARTIES}.` });
  if (issues.length > 0) return { ok: false, issues };

  const parties = named.reduce<BuiltParty[]>((list, column) => addCatalogParty(list, byAcronym.get(column)!), []);
  const result = importCsv(text, { schemaVersion: 1, seatTable: "2026", parties, provinces: {} }, reference, censusYear);
  return result.ok ? { ...result, parties } : result;
}
