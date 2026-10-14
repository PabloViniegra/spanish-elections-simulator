import { useState } from "react";
import { ProvinceMap } from "@/components/simulator/province-map";
import type { Bloc } from "@/lib/elections/types";

type BuiltMapProps = {
  leaders: ReadonlyMap<string, readonly Bloc[]>;
  current: string;
  onGo: (code: string) => void;
};

const NO_LOCKS: ReadonlySet<string> = new Set();

// The province index beside it is the keyboard route to the same provinces.
export function BuiltMap({ leaders, current, onGo }: BuiltMapProps) {
  const [active, setActive] = useState<string | null>(null);
  return (
    <div className="flex min-w-0 flex-col gap-3">
      <ProvinceMap
      leaders={leaders}
      active={active}
      selected={current}
      lockedCodes={NO_LOCKS}
      label="Mapa de provincias: las completas, del color del partido con más escaños."
      onActive={setActive}
      onPick={onGo}
      />
      <p className="text-caption text-ink-muted-80">Las rayas grises marcan un empate en escaños. Las provincias sin completar aparecen sin color.</p>
    </div>
  );
}
