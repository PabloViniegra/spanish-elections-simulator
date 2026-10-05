// Builds src/data/elections/<id>.json from the Ministerio del Interior's
// Infoelectoral downloads (Congreso, totals by constituency) and fails if the
// engine does not reproduce the official seats. Downloads are cached in
// node_modules/.cache/infoelectoral; `pnpm data:build`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";
import { officialSeatMismatches } from "@/lib/elections/official-seats";
import type { Election, ElectionConstituency } from "@/lib/elections/types";

const elections = [
  { id: "2023-07", date: "2023-07-23" },
  { id: "2019-11", date: "2019-11-10" },
  { id: "2019-04", date: "2019-04-28" },
  { id: "2016-06", date: "2016-06-26" },
];
const SOURCE_URL = "https://infoelectoral.interior.gob.es/estaticos/docxl/apliextr";
const CACHE_DIR = path.join("node_modules", ".cache", "infoelectoral");
const OUTPUT_DIR = path.join("src", "data", "elections");

// Fixed-width fields from the Infoelectoral file spec (FICHEROS.doc), as
// zero-based [start, end) slices. Rows with province 99 or district other
// than 9 are community, national or sub-provincial totals and are skipped.
const PROVINCE = [11, 13] as const;
const DISTRICT = [13, 14] as const;

await mkdir(CACHE_DIR, { recursive: true });
await mkdir(OUTPUT_DIR, { recursive: true });

for (const { id, date } of elections) {
  const files = unzipSync(await download(`02${id.replace("-", "")}_TOTA.zip`));
  const lines = (type: string) => {
    const name = Object.keys(files).find((file) => file.startsWith(type) && file.endsWith(".DAT"));
    if (!name) throw new Error(`${id}: file ${type} missing from the download`);
    return new TextDecoder("latin1").decode(files[name]).split(/\r?\n/).filter(Boolean);
  };
  const provincial = (line: string) => field(line, PROVINCE) !== "99" && field(line, DISTRICT) === "9";

  const rows = Map.groupBy(lines("08").filter(provincial), (line) => field(line, PROVINCE));

  const constituencies: ElectionConstituency[] = lines("07")
    .filter(provincial)
    .map((line) => {
      const code = field(line, PROVINCE);
      const constituency = {
        code,
        name: field(line, [14, 64]),
        seats: number(line, [149, 155]),
        population: number(line, [64, 72]),
        census: number(line, [85, 93]),
        blankVotes: number(line, [125, 133]),
        nullVotes: number(line, [133, 141]),
        results: (rows.get(code) ?? []).map((row) => ({
          candidacyId: candidacyId(row, [14, 20]),
          votes: number(row, [20, 28]),
          elected: number(row, [28, 33]),
        })),
      };
      const counted = constituency.results.reduce((sum, result) => sum + result.votes, 0);
      if (counted !== number(line, [141, 149])) {
        throw new Error(`${id}: candidacy votes in ${code} add up to ${counted}, not the official total`);
      }
      return constituency;
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const ran = new Set(constituencies.flatMap((constituency) => constituency.results.map((result) => result.candidacyId)));
  const candidacies = lines("03")
    .map((line) => ({ id: candidacyId(line, [8, 14]), acronym: field(line, [14, 64]), name: field(line, [64, 214]) }))
    .filter((candidacy) => ran.has(candidacy.id));
  const unnamed = [...ran].filter((ranId) => !candidacies.some((candidacy) => candidacy.id === ranId));
  if (unnamed.length > 0) throw new Error(`${id}: candidacies ${unnamed.join(", ")} have results but no name`);

  const election: Election = { id, date, candidacies, constituencies };
  const mismatches = officialSeatMismatches(election);
  if (mismatches.length > 0) {
    throw new Error(`${id}: engine seats differ from the official ones in ${mismatches.join(", ")}`);
  }
  await writeFile(path.join(OUTPUT_DIR, `${id}.json`), `${JSON.stringify(election)}\n`);
  console.log(`${id}: ${constituencies.length} constituencies, ${candidacies.length} candidacies, seats match.`);
}

async function download(file: string) {
  const cached = path.join(CACHE_DIR, file);
  try {
    return new Uint8Array(await readFile(cached));
  } catch {
    // Infoelectoral stalls requests without a browser user agent.
    const response = await fetch(`${SOURCE_URL}/${file}`, { headers: { "User-Agent": "Mozilla/5.0" } });
    if (!response.ok) throw new Error(`Downloading ${file} failed with ${response.status}`);
    const data = new Uint8Array(await response.arrayBuffer());
    await writeFile(cached, data);
    return data;
  }
}

function field(line: string, [start, end]: readonly [number, number]) {
  return line.slice(start, end).trim();
}

function number(line: string, slice: readonly [number, number]) {
  return Number.parseInt(field(line, slice), 10);
}

function candidacyId(line: string, slice: readonly [number, number]) {
  return String(number(line, slice));
}
