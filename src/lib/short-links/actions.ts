"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, firstBlocked, shortLinkLimits } from "@/lib/rate-limit/rules";
import { consume } from "@/lib/rate-limit/store";
import { parseScenarioParam } from "@/lib/scenario/url";
import { SCENARIO_MAX } from "@/lib/simulations/limits";
import { storeShortLink } from "./queries";

// The short link id, or null when the scenario is not valid or the address
// has made too many; the caller then shares the full address.
export async function shortenScenario(input: string) {
  const scenario = z.string().max(SCENARIO_MAX).safeParse(input);
  if (!scenario.success) return null;
  if ((await firstBlocked(shortLinkLimits(clientIp(await headers())), consume)) !== null) return null;
  return parseScenarioParam(scenario.data) ? storeShortLink(scenario.data) : null;
}
