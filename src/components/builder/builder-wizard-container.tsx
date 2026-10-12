"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useRef, useState, useTransition } from "react";
import { notify } from "@/components/feedback/notify";
import { builderHref, builderResultsHref } from "@/lib/builder/address";
import { allocateProvince, castVotes, partyBlocs, provinceStatus } from "@/lib/builder/allocate";
import { addPartyHere, eligibleParties, fillFromLatest, latestVotes, setOtherVotes, setPartyVotes, setRunning, startProvince } from "@/lib/builder/edit";
import { addCatalogParty, addCustomParty } from "@/lib/builder/parties";
import { catalog, censusElection, latestResults, builderReference as reference, seatTables } from "@/lib/builder/reference";
import { MAX_PARTIES } from "@/lib/builder/schema";
import type { BuiltScenario } from "@/lib/builder/types";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { provinces } from "@/lib/provinces";
import { provinceWinners } from "@/lib/scenario/province-winners";
import { deleteSimulation } from "@/lib/simulations/actions";
import { BuilderWizard } from "./builder-wizard";
import { PROVINCE_HEADING_ID } from "./province-heading";
import { useAutosave } from "./use-autosave";

type BuilderWizardContainerProps = {
  id: string;
  name: string;
  initial: BuiltScenario;
  revision: number;
  // Where to start when the address names no province.
  start: string;
};

const nameOf = (code: string) => provinces.find((province) => province.code === code)?.name ?? code;

export function BuilderWizardContainer({ id, name, initial, revision, start }: BuilderWizardContainerProps) {
  const requested = useSearchParams().get("p");
  const code = requested && CONSTITUENCY_CODES.includes(requested) ? requested : start;
  const [scenario, setScenario] = useState(initial);
  const autosave = useAutosave(id, JSON.stringify(scenario), revision);
  const router = useRouter();
  const [discarding, startDiscard] = useTransition();
  const discard = () =>
    startDiscard(async () => {
      if (!(await deleteSimulation(id).catch(() => false))) {
        notify.error({ title: "No se pudieron descartar", description: "Comprueba tu conexión e inténtalo de nuevo." });
        return;
      }
      autosave.discard();
      notify.success({ title: "Elecciones descartadas", description: `«${name}» ya no está en tu perfil.` });
      router.replace("/profile");
    });

  // Name the province in the address, so going back returns to it and not to
  // wherever the server would start then.
  useEffect(() => {
    if (requested !== code) window.history.replaceState(null, "", builderHref(id, code));
  }, [requested, code, id]);

  // A new province takes the reader, and the focus, to its name.
  const shown = useRef(code);
  useEffect(() => {
    if (shown.current === code) return;
    shown.current = code;
    const heading = document.getElementById(PROVINCE_HEADING_ID);
    heading?.focus({ preventScroll: true });
    heading?.scrollIntoView({ block: "start" });
  }, [code]);

  const go = (next: string) => {
    autosave.flush();
    window.history.pushState(null, "", builderHref(id, next));
  };
  const step = (offset: number) => {
    const next = CONSTITUENCY_CODES[CONSTITUENCY_CODES.indexOf(code) + offset];
    return next ? { code: next, name: nameOf(next), href: builderHref(id, next) } : null;
  };

  const seats = seatTables[scenario.seatTable];
  const blocs = partyBlocs(scenario);
  const blocById = new Map(blocs.map((bloc) => [bloc.id, bloc]));
  const statuses = CONSTITUENCY_CODES.map((each) => ({ code: each, status: provinceStatus(scenario, each, reference) }));
  const complete = statuses.filter(({ status }) => status === "complete");
  const winners = provinceWinners(complete.map((each) => allocateProvince(scenario, each.code, seats)));
  const leaders = new Map([...winners].map(([each, { leaders: ids }]) => [each, ids.flatMap((leader) => blocById.get(leader) ?? [])]));
  // A province not started yet shows, and starts with, the parties that ran there last time.
  const latest = latestResults.get(code);
  const province = startProvince(scenario, code, reference, latest).provinces[code];
  const edit = (change: (current: BuiltScenario) => BuiltScenario) => setScenario((current) => change(startProvince(current, code, reference, latest)));
  const result = allocateProvince(scenario, code, seats);
  const eligible = new Set(eligibleParties(scenario, code, reference).map((party) => party.id));
  // Parties marked where they never ran stay listed, so they can be unmarked.
  const listed = scenario.parties.filter((party) => eligible.has(party.id) || party.id in province.votes);
  const status = statuses.find((each) => each.code === code)?.status ?? "empty";
  const year = censusElection.slice(0, 4);
  const chosen = new Set(scenario.parties.flatMap(({ catalogId }) => (catalogId ? [reference.catalog.get(catalogId)?.id ?? catalogId] : [])));
  const here = catalog.filter((party) => party.provinces.includes(code)).sort((a, b) => (latest?.votes[b.id] ?? -1) - (latest?.votes[a.id] ?? -1));

  return (
    <BuilderWizard
      name={name}
      completed={complete.length}
      // The results page reads the saved copy, so it waits for the save.
      resultsHref={complete.length === CONSTITUENCY_CODES.length && autosave.status.kind === "saved" ? builderResultsHref(id) : null}
      save={{ status: autosave.status, onRetry: autosave.flush }}
      discard={{ pending: discarding, onDiscard: discard }}
      heading={{
        name: nameOf(code),
        position: CONSTITUENCY_CODES.indexOf(code) + 1,
        seats: seats.get(code) ?? 0,
        census: reference.census.get(code) ?? 0,
        cast: castVotes(province),
        status,
        censusYear: year,
        outside: listed.filter((party) => !eligible.has(party.id)).map((party) => party.name),
      }}
      votes={{
        provinceName: nameOf(code),
        parties: listed.map((party) => ({
          ...party,
          fullName: party.catalogId ? reference.catalog.get(party.catalogId)?.name : undefined,
          previous: latestVotes(party, reference, latest),
        })),
        previousYear: year,
        elsewhere: scenario.parties.length - listed.length,
        province,
        excluded: new Set(result.candidacies.filter(({ excluded }) => excluded).map(({ id: party }) => party)),
        onRunning: (party, running) => edit((current) => setRunning(current, code, party, running)),
        onVotes: (party, votes) => edit((current) => setPartyVotes(current, code, party, votes)),
        onOther: (kind, votes) => edit((current) => setOtherVotes(current, code, kind, votes)),
        onFill: () => edit((current) => fillFromLatest(current, code, reference, latest)),
      }}
      adder={{
        provinceName: nameOf(code),
        catalog: here,
        chosen,
        full: scenario.parties.length >= MAX_PARTIES,
        onAddCatalog: (party) => edit((current) => addPartyHere(current, code, addCatalogParty(current.parties, party))),
        onAddCustom: (name) => edit((current) => addPartyHere(current, code, addCustomParty(current.parties, name))),
      }}
      allocation={{ provinceName: nameOf(code), result, blocs: blocById }}
      stepper={{ previous: step(-1), next: step(1), onGo: go }}
      index={{
        provinces: statuses.map((each) => ({ ...each, name: nameOf(each.code), href: builderHref(id, each.code) })),
        current: code,
        onGo: go,
      }}
      map={{ leaders, current: code, onGo: go }}
      importer={{ scenario, onImport: (imported) => setScenario((current) => ({ ...current, provinces: imported })), onSave: autosave.save }}
    />
  );
}
