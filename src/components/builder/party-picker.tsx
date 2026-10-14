import { useId, useState } from "react";
import { controlClassName } from "@/components/forms/field";
import type { CatalogParty } from "@/lib/builder/types";
import { PartyAcronym } from "./party-acronym";
import { territory } from "./territory";

const SHOWN = 8;

const fold = (text: string) =>
  text
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

type PartyPickerProps = {
  catalog: readonly CatalogParty[];
  chosen: ReadonlySet<string>;
  full: boolean;
  onAdd: (party: CatalogParty) => void;
  label?: string;
};

export function PartyPicker({ catalog, chosen, full, onAdd, label = "Buscar partidos que se presentaron desde 2016" }: PartyPickerProps) {
  const id = useId();
  const [query, setQuery] = useState("");
  const folded = fold(query.trim());
  const matches = folded ? catalog.filter(({ acronym, name }) => fold(acronym).includes(folded) || fold(name).includes(folded)) : catalog;
  const shown = matches.slice(0, SHOWN);

  return (
    <div className="flex flex-col gap-3">
      <label htmlFor={id} className="px-1 text-caption font-semibold">
        {label}
      </label>
      <input
        id={id}
        type="search"
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        aria-describedby={`${id}-count`}
        autoComplete="off"
        className={controlClassName}
      />
      <p id={`${id}-count`} aria-live="polite" className="px-1 text-caption text-ink-muted-80">
        {matches.length === 0
          ? "Ningún partido coincide. Puedes crearlo abajo."
          : matches.length > SHOWN
            ? `${matches.length} partidos coinciden; se muestran los ${SHOWN} primeros.`
            : matches.length === 1
              ? "1 partido coincide."
              : `${matches.length} partidos coinciden.`}
      </p>
      <ul className="flex flex-col divide-y divide-hairline rounded-sm border border-hairline">
        {shown.map((party) => {
          const added = chosen.has(party.id);
          return (
            <li key={party.id} className="flex items-center gap-3 px-4 py-2">
              <span aria-hidden className="size-3 shrink-0 rounded-full" style={{ backgroundColor: party.colour }} />
              <span className="flex min-w-0 flex-1 flex-col">
                <PartyAcronym acronym={party.acronym} name={party.name} />
                <span className="text-caption text-ink-muted-80">{territory(party)}</span>
              </span>
              <button
                type="button"
                onClick={() => onAdd(party)}
                disabled={added || full}
                className="min-h-11 shrink-0 rounded-full border border-ink px-4 text-caption font-semibold transition-colors duration-150 enabled:hover:bg-canvas-parchment disabled:border-ink-muted-48 disabled:text-ink-muted-80"
              >
                {added ? "Añadido" : "Añadir"}
                <span className="sr-only"> {party.acronym}</span>
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
