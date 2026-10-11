import { MAX_PARTIES } from "@/lib/builder/schema";
import type { CatalogParty } from "@/lib/builder/types";
import { CustomPartyAdder } from "./custom-party-adder";
import { PartyPicker } from "./party-picker";

type ProvincePartyAdderProps = {
  provinceName: string;
  // Catalogue parties that ran in this province, most voted here first.
  catalog: readonly CatalogParty[];
  chosen: ReadonlySet<string>;
  full: boolean;
  onAddCatalog: (party: CatalogParty) => void;
  onAddCustom: (name: string) => void;
};

// A party missing from the list joins it, and runs here, without leaving the province.
export function ProvincePartyAdder({ provinceName, catalog, chosen, full, onAddCatalog, onAddCustom }: ProvincePartyAdderProps) {
  return (
    <details className="min-w-0 rounded-sm border border-hairline">
      <summary className="min-h-11 cursor-pointer px-4 py-3 text-caption font-semibold">¿Falta un partido? Añádelo a tu lista</summary>
      <div className="flex flex-col gap-6 border-t border-hairline p-4">
        <p className="text-caption text-ink-muted-80">
          {full
            ? `Tu lista ya tiene ${MAX_PARTIES} partidos, el máximo.`
            : `Se añade a tu lista y se presenta en ${provinceName}. En las demás provincias lo marcas donde quieras.`}
        </p>
        <PartyPicker label={`Buscar partidos que se presentaron en ${provinceName}`} catalog={catalog} chosen={chosen} full={full} onAdd={onAddCatalog} />
        <CustomPartyAdder full={full} onAdd={onAddCustom} />
      </div>
    </details>
  );
}
