// Builds src/data/map/provinces.json: SVG paths of the 52 constituencies,
// projected once so the browser ships no map library. Geometry is the IGN
// (CNIG) provincial boundaries from es-atlas, drawn with the conic conformal
// projection for Spain, which moves the Canary Islands into an inset;
// `pnpm map:build`.
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { createRequire } from "node:module";
import path from "node:path";
import { geoPath } from "d3-geo";
import type { FeatureCollection, Geometry } from "geojson";
import { feature } from "topojson-client";
import type { Topology } from "topojson-specification";
import { provinces } from "@/lib/provinces";

// SAFETY: the package ships a UMD bundle without named ESM exports; its
// index.d.ts describes that same bundle.
const { geoConicConformalSpain } = createRequire(import.meta.url)("d3-composite-projections") as typeof import("d3-composite-projections");

const WIDTH = 600;
const PADDING = 8;
const OUTPUT = path.join("src", "data", "map", "provinces.json");

// SAFETY: es-atlas is pinned and its provinces.json is a TopoJSON topology.
const topology = JSON.parse(await readFile(path.join("node_modules", "es-atlas", "es", "provinces.json"), "utf8")) as Topology;
// SAFETY: `provinces` is a geometry collection, which feature() turns into a
// feature collection; the count check below guards the ids.
const all = feature(topology, topology.objects.provinces) as FeatureCollection<Geometry>;
// Code 54 holds the minor sovereign territories, which elect no deputies.
const codes = new Set(provinces.map(({ code }) => code));
const constituencies = { ...all, features: all.features.filter((province) => codes.has(String(province.id))) };
if (constituencies.features.length !== codes.size) throw new Error(`Expected ${codes.size} provinces, found ${constituencies.features.length}`);

// Fit the width in a tall box first, then size the height to the drawing.
const projection = geoConicConformalSpain().fitSize([WIDTH - 2 * PADDING, 10 * WIDTH], constituencies);
const [[, top], [, bottom]] = geoPath(projection).bounds(constituencies);
const height = Math.ceil(bottom - top) + 2 * PADDING;
projection.fitExtent([[PADDING, PADDING], [WIDTH - PADDING, height - PADDING]], constituencies);
const draw = geoPath(projection).digits(1);
const round = (value: number) => Math.round(value * 10) / 10;
// Closed frame around the Canary Islands inset, a few units clear of them.
const canaries = { ...constituencies, features: constituencies.features.filter((province) => ["35", "38"].includes(String(province.id))) };
const [[left, upper], [right, lower]] = geoPath(projection).bounds(canaries);
const FRAME = 6;

const map = {
  width: WIDTH,
  height,
  inset: `M${round(left - FRAME)},${round(upper - FRAME)}H${round(right + FRAME)}V${round(lower + FRAME)}H${round(left - FRAME)}Z`,
  provinces: constituencies.features
    .map((province) => {
      const [x, y] = draw.centroid(province);
      return { code: String(province.id), d: draw(province) ?? "", x: round(x), y: round(y) };
    })
    .sort((a, b) => a.code.localeCompare(b.code)),
};

await mkdir(path.dirname(OUTPUT), { recursive: true });
await writeFile(OUTPUT, `${JSON.stringify(map)}\n`);
console.log(`${OUTPUT}: ${map.provinces.length} provinces, ${(JSON.stringify(map).length / 1024).toFixed(0)} KB`);
