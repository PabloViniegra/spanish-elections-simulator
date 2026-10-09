import { type NextRequest, NextResponse } from "next/server";
import { chamberImage } from "@/components/og/chamber-image";
import { SCENARIO_PARAM } from "@/lib/scenario/url";
import { SCENARIO_MAX } from "@/lib/simulations/limits";
import { summarizeSimulation } from "@/lib/simulations/summary";

const LEGEND_MAX = 6;
// The image depends only on its URL; a deploy clears the CDN copy.
const headers = { "cache-control": "public, max-age=3600, s-maxage=31536000" };

// The preview of a shared scenario (opengraph-image files get no search params).
// A broken link is sent to the site's own image, already rendered, and an
// oversized one is not decompressed at all.
export function GET(request: NextRequest) {
  const param = request.nextUrl.searchParams.get(SCENARIO_PARAM);
  const summary = param && param.length <= SCENARIO_MAX ? summarizeSimulation(param) : null;
  if (!summary) return NextResponse.redirect(new URL("/opengraph-image", request.url), 308);

  // Largest first, the smallest blocs grouped so the legend fits.
  const { ranked } = summary;
  const rest = ranked.slice(LEGEND_MAX).reduce((sum, bloc) => sum + bloc.seats, 0);
  const shown = ranked.slice(0, LEGEND_MAX).map(({ name, colour, seats }) => ({ name, colour, seats }));
  const legend = rest > 0 ? [...shown, { name: "Resto", colour: "#666666", seats: rest }] : shown;
  return chamberImage(
    {
      title: "Así quedarían los 350 escaños",
      fills: legend.flatMap(({ colour, seats }) => Array<string>(seats).fill(colour)),
      legend,
      hemicycleWidth: 600,
    },
    headers,
  );
}
