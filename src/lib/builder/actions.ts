"use server";

import { revalidatePath } from "next/cache";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getSession } from "@/lib/auth/session";
import { clientIp, firstBlocked, shortLinkLimits } from "@/lib/rate-limit/rules";
import { consume } from "@/lib/rate-limit/store";
import { storeShortLink } from "@/lib/short-links/queries";
import type { SaveState } from "@/lib/simulations/forms";
import { insertSimulationIfRoom } from "@/lib/simulations/queries";
import { builderHref } from "./address";
import { isComplete } from "./allocate";
import { findBuilt, updateOwnedBuilt } from "./queries";
import { builderReference } from "./reference";
import { createBuiltAs, type DraftState, saveBuiltDraftAs, validBuilt } from "./save";
import { BUILT_SCENARIO_MAX } from "./schema";

const id = z.string().max(64);
const json = z.string().max(BUILT_SCENARIO_MAX);

// Opens the first province of the new election, or returns why it was not created.
export async function createBuilt(_prev: SaveState, formData: FormData): Promise<SaveState> {
  const session = await getSession();
  const state = await createBuiltAs(session?.user.id, formData, insertSimulationIfRoom, builderReference);
  if (!state?.id) return state;
  revalidatePath("/profile");
  redirect(builderHref(state.id));
}

export async function saveBuiltDraft(simulationId: string, scenario: string, expected: string): Promise<DraftState> {
  const session = await getSession();
  const input = z.tuple([id, json, json]).safeParse([simulationId, scenario, expected]);
  if (!input.success) return { error: "Los datos de las elecciones no son válidos." };
  // No revalidation: it would re-render the wizard with every save and could
  // overtake a navigation away from it. The profile is dynamic anyway.
  return saveBuiltDraftAs(session?.user.id, input.data[0], input.data[1], updateOwnedBuilt, builderReference, input.data[2]);
}

// The short link id of a complete built election the user owns, or null. The
// link keeps the election as it is now; later edits do not change it.
export async function shareBuilt(simulationId: string) {
  const session = await getSession();
  const input = id.safeParse(simulationId);
  if (!session || !input.success) return null;
  const found = await findBuilt(session.user.id, input.data);
  const scenario = found && validBuilt(found.scenario, builderReference);
  if (!found || !scenario || !isComplete(scenario, builderReference)) return null;
  if ((await firstBlocked(shortLinkLimits(clientIp(await headers())), consume)) !== null) return null;
  return storeShortLink(found.scenario, "built");
}
