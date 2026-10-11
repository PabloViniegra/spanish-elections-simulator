"use client";

import { useSearchParams } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { builderHref, builderResultsHref } from "@/lib/builder/address";
import { allocateProvince, castVotes, partyBlocs, provinceStatus } from "@/lib/builder/allocate";
import { eligibleParties, setOtherVotes, setPartyVotes, setRunning } from "@/lib/builder/edit";
import { builderReference as reference, censusElection, seatTables } from "@/lib/builder/reference";
import type { BuiltScenario } from "@/lib/builder/types";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { provinces } from "@/lib/provinces";
import { provinceWinners } from "@/lib/scenario/province-winners";
import { BuilderWizard } from "./builder-wizard";
import { PROVINCE_HEADING_ID } from "./province-heading";
import { useAutosave } from "./use-autosave";

type BuilderWizardContainerProps = {
  id: string;
  name: string;
  initial: BuiltScenario;
  stored: string;
  // Where to start when the address names no province.
  start: string;
};

const nameOf = (code: string) => provinces.find((province) => province.code === code)?.name ?? code;

export function BuilderWizardContainer({ id, name, initial, stored, start }: BuilderWizardContainerProps) {
  const requested = useSearchParams().get("p");
  const code = requested && CONSTITUENCY_CODES.includes(requested) ? requested : start;
  const [scenario, setScenario] = useState(initial);
  const autosave = useAutosave(id, JSON.stringify(scenario), stored);

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
  const province = scenario.provinces[code] ?? { votes: {}, blank: 0, null: 0 };
  const result = allocateProvince(scenario, code, seats);
  const eligible = eligibleParties(scenario, code, reference);
  const status = statuses.find((each) => each.code === code)?.status ?? "empty";

  return (
    <BuilderWizard
      name={name}
      completed={complete.length}
      // The results page reads the saved copy, so it waits for the save.
      resultsHref={complete.length === CONSTITUENCY_CODES.length && autosave.status.kind === "saved" ? builderResultsHref(id) : null}
      save={{ status: autosave.status, onRetry: autosave.flush }}
      heading={{
        name: nameOf(code),
        position: CONSTITUENCY_CODES.indexOf(code) + 1,
        seats: seats.get(code) ?? 0,
        census: reference.census.get(code) ?? 0,
        cast: castVotes(province),
        status,
        censusYear: censusElection.slice(0, 4),
      }}
      votes={{
        provinceName: nameOf(code),
        parties: eligible.map((party) => ({ ...party, fullName: party.catalogId ? reference.catalog.get(party.catalogId)?.name : undefined })),
        elsewhere: scenario.parties.length - eligible.length,
        province,
        excluded: new Set(result.candidacies.filter(({ excluded }) => excluded).map(({ id: party }) => party)),
        onRunning: (party, running) => setScenario((current) => setRunning(current, code, party, running)),
        onVotes: (party, votes) => setScenario((current) => setPartyVotes(current, code, party, votes)),
        onOther: (kind, votes) => setScenario((current) => setOtherVotes(current, code, kind, votes)),
      }}
      allocation={{ provinceName: nameOf(code), result, blocs: blocById }}
      stepper={{ previous: step(-1), next: step(1), onGo: go }}
      index={{
        provinces: statuses.map((each) => ({ ...each, name: nameOf(each.code), href: builderHref(id, each.code) })),
        current: code,
        onGo: go,
      }}
      map={{ leaders, current: code, onGo: go }}
    />
  );
}
