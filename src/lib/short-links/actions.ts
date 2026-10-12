"use server";

import { headers } from "next/headers";
import { z } from "zod";
import { clientIp, firstBlocked, shortLinkLimits } from "@/lib/rate-limit/rules";
import { consume } from "@/lib/rate-limit/store";
import { restoreScenario } from "@/lib/scenario/restore";
import { SCENARIO_MAX } from "@/lib/simulations/limits";
import { storeShortLink } from "./queries";

// The short link id, or null when the scenario does not restore (as saving
// requires) or the address has made too many; the caller then shares the
// full address.
export async function shortenScenario(input: string) {
  const scenario = z.string().max(SCENARIO_MAX).safeParse(input);
  if (!scenario.success) return null;
  if ((await firstBlocked(shortLinkLimits(clientIp(await headers())), consume)) !== null) return null;
  return restoreScenario(scenario.data) ? storeShortLink(scenario.data) : null;
}
