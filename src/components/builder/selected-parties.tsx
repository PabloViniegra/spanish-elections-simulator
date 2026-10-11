import { MAX_PARTIES } from "@/lib/builder/schema";
import type { BuiltParty, CatalogParty } from "@/lib/builder/types";
import { PartyAcronym } from "./party-acronym";
import { territory } from "./territory";

type SelectedPartiesProps = {
  parties: readonly BuiltParty[];
  catalog: ReadonlyMap<string, CatalogParty>;
  error?: string;
  onRecolour: (id: string, colour: string) => void;
  onRemove: (id: string) => void;
};

export function SelectedParties({ parties, catalog, error, onRecolour, onRemove }: SelectedPartiesProps) {
  return (
    <section aria-labelledby="partidos-elegidos" className="flex flex-col gap-3">
      <div className="flex items-baseline justify-between gap-4 px-1">
        <h2 id="partidos-elegidos" className="text-body font-semibold">
          Partidos de estas elecciones
        </h2>
        <p aria-live="polite" className="text-caption text-ink-muted-80">
          {parties.length} de {MAX_PARTIES}
        </p>
      </div>
      {error && (
        <p role="alert" tabIndex={-1} className="px-1 text-caption text-error">
          {error}
        </p>
      )}
      {parties.length === 0 ? (
        <p className="rounded-sm border border-dashed border-ink-muted-48 px-4 py-6 text-center text-caption text-ink-muted-80">
          Añade los partidos que se presentan. Después elegirás en qué provincias compite cada uno.
        </p>
      ) : (
        <ul className="flex flex-col gap-2">
          {parties.map((party) => {
            const known = party.catalogId ? catalog.get(party.catalogId) : undefined;
            return (
              <li key={party.id} className="flex items-center gap-3">
                <input
                  type="color"
                  value={party.colour}
                  onChange={(event) => onRecolour(party.id, event.target.value)}
                  aria-label={`Color de ${party.name}`}
                  className="size-11 shrink-0 cursor-pointer rounded-sm border border-ink-muted-48 bg-canvas p-1"
                />
                <span className="flex min-w-0 flex-1 flex-col break-words [overflow-wrap:anywhere]">
                  <PartyAcronym acronym={party.name} name={known?.name} />
                  <span className="text-caption text-ink-muted-80">{known ? territory(known) : "Partido propio, en cualquier provincia"}</span>
                </span>
                <button
                  type="button"
                  onClick={() => onRemove(party.id)}
                  className="min-h-11 shrink-0 rounded-sm px-3 text-caption text-ink underline underline-offset-4"
                >
                  Quitar<span className="sr-only"> {party.name}</span>
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
