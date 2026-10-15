// Builds src/data/senate/<id>.json from the Ministerio del Interior's
// Infoelectoral downloads (Senado, totals by constituency) and fails if the
// official winners are not the most voted candidates of each constituency.
// Downloads are cached in node_modules/.cache/infoelectoral; `pnpm data:senate`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { unzipSync } from "fflate";
import type { SenateConstituency, SenateElection } from "@/lib/senate/types";

const elections = [{ id: "2023-07", date: "2023-07-23" }];
const SOURCE_URL = "https://infoelectoral.interior.gob.es/estaticos/docxl/apliextr";
const CACHE_DIR = path.join("node_modules", ".cache", "infoelectoral");
const OUTPUT_DIR = path.join("src", "data", "senate");
const ELECTED_SEATS = 208;

// Fixed-width fields from the Infoelectoral file spec (FICHEROS.doc), as
// zero-based [start, end) slices. A Senate constituency is a province plus a
// district: 9 for a whole province, 1-7 for an island. Province 99 rows are
// community or national totals.
const PROVINCE = [11, 13] as const;
const DISTRICT = [13, 14] as const;

await mkdir(CACHE_DIR, { recursive: true });
await mkdir(OUTPUT_DIR, { recursive: true });

for (const { id, date } of elections) {
  const files = unzipSync(await download(`03${id.replace("-", "")}_TOTA.zip`));
  const lines = (type: string) => {
    const name = Object.keys(files).find((file) => file.startsWith(type) && file.endsWith(".DAT"));
    if (!name) throw new Error(`${id}: file ${type} missing from the download`);
    return new TextDecoder("latin1").decode(files[name]).split(/\r?\n/).filter(Boolean);
  };

  const acronyms = new Map(lines("03").map((line) => [field(line, [8, 14]), field(line, [14, 64])]));
  // Each Senate candidate has a titular (T), who is on the ballot, and a substitute (S).
  const titulars = new Map(
    lines("04")
      .filter((line) => field(line, [24, 25]) === "T")
      .map((line) => [
        field(line, [9, 15]),
        {
          name: [field(line, [25, 50]), field(line, [50, 75]), field(line, [75, 100])].filter(Boolean).join(" "),
          party: acronyms.get(field(line, [15, 21])) ?? "",
        },
      ]),
  );

  const totals = lines("07").filter((line) => field(line, PROVINCE) !== "99");
  const islands = new Set(totals.filter((line) => field(line, DISTRICT) !== "9").map((line) => field(line, PROVINCE)));
  const isConstituency = (line: string) => field(line, DISTRICT) !== "9" || !islands.has(field(line, PROVINCE));
  const key = (line: string) => `${field(line, PROVINCE)}${field(line, DISTRICT)}`;
  const rows = Map.groupBy(
    lines("08").filter((line) => field(line, PROVINCE) !== "99"),
    key,
  );

  const constituencies: SenateConstituency[] = totals
    .filter(isConstituency)
    .map((line) => {
      const code = key(line);
      const seats = number(line, [149, 155]);
      const candidates = (rows.get(code) ?? [])
        .map((row) => {
          const titular = titulars.get(field(row, [14, 20]));
          if (!titular) throw new Error(`${id}: senator ${field(row, [14, 20])} has votes but no candidate`);
          return { ...titular, votes: number(row, [20, 28]), elected: number(row, [28, 33]) === 1 };
        })
        .sort((a, b) => b.votes - a.votes);
      const elected = candidates.filter((candidate) => candidate.elected).length;
      if (elected !== seats) throw new Error(`${id}: ${code} elected ${elected} senators, not ${seats}`);
      if (candidates.slice(0, seats).some((candidate) => !candidate.elected)) {
        throw new Error(`${id}: the winners in ${code} are not the most voted candidates`);
      }
      return { code, province: field(line, PROVINCE), name: field(line, [14, 64]), seats, census: number(line, [85, 93]), candidates };
    })
    .sort((a, b) => a.code.localeCompare(b.code));

  const seats = constituencies.reduce((sum, constituency) => sum + constituency.seats, 0);
  if (seats !== ELECTED_SEATS) throw new Error(`${id}: constituencies elect ${seats} senators, not ${ELECTED_SEATS}`);

  const election: SenateElection = { id, date, constituencies };
  await writeFile(path.join(OUTPUT_DIR, `${id}.json`), `${JSON.stringify(election)}\n`);
  console.log(`${id}: ${constituencies.length} constituencies, ${seats} senators, winners match.`);
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
