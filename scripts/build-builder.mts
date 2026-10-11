// Builds src/data/builder.json for the election builder from the election
// files already in src/data/elections: the party catalogue of every base
// election and the census of the most recent one; `pnpm data:builder`.
import { writeFile } from "node:fs/promises";
import path from "node:path";
import { buildCatalog } from "@/lib/builder/catalog";
import { baseOptions } from "@/lib/elections/base-options";
import { loadBase } from "@/lib/elections/load-base";

const OUTPUT = path.join("src", "data", "builder.json");

const bases = await Promise.all(baseOptions.map(async ({ id }) => (await loadBase(id))!));
const latest = bases[0].election;
const census = Object.fromEntries(latest.constituencies.map(({ code, census: count }) => [code, count]));
const parties = buildCatalog(bases);

await writeFile(OUTPUT, `${JSON.stringify({ censusElection: latest.id, census, parties })}\n`);
console.log(`builder: ${parties.length} catalogue parties, census of ${latest.id}.`);
