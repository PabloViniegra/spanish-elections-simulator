"use client";

import { useActionState, useMemo, useState } from "react";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { createBuilt } from "@/lib/builder/actions";
import { addCatalogParty, addCustomParty, recolourParty, removeParty } from "@/lib/builder/parties";
import { MAX_PARTIES } from "@/lib/builder/schema";
import type { BuiltParty, CatalogParty, SeatTable } from "@/lib/builder/types";
import { BuilderSetupForm } from "./builder-setup-form";

// The fields are controlled so the post-action form reset cannot wipe them.
export function BuilderSetupContainer({ catalog }: { catalog: readonly CatalogParty[] }) {
  const [state, action, pending] = useActionState(createBuilt, undefined);
  const ref = useFocusOnError(state);
  const [name, setName] = useState("");
  const [seatTable, setSeatTable] = useState<SeatTable>("2026");
  const [parties, setParties] = useState<BuiltParty[]>([]);
  const catalogById = useMemo(() => new Map(catalog.map((party) => [party.id, party])), [catalog]);

  return (
    <div ref={ref}>
      <BuilderSetupForm
        state={state}
        action={action}
        pending={pending}
        catalog={catalog}
        catalogById={catalogById}
        name={name}
        seatTable={seatTable}
        parties={parties}
        full={parties.length >= MAX_PARTIES}
        onName={setName}
        onSeatTable={setSeatTable}
        onAddCatalog={(party) => setParties((current) => addCatalogParty(current, party))}
        onAddCustom={(custom) => setParties((current) => addCustomParty(current, custom))}
        onRecolour={(id, colour) => setParties((current) => recolourParty(current, id, colour))}
        onRemove={(id) => setParties((current) => removeParty(current, id))}
      />
    </div>
  );
}
