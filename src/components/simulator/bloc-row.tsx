import { useState } from "react";
import type { Bloc } from "@/lib/elections/types";
import { BLOC_NAME_MAX } from "@/lib/scenario/blocs";

type BlocRowProps = {
  bloc: Bloc;
  removable: boolean;
  onRename: (name: string) => void;
  onRecolour: (colour: string) => void;
  onRemove: () => void;
};

// One bloc's colour and name (FR-11). The name field keeps what is typed, but
// only a name with letters reaches the scenario; leaving it empty brings the
// last one back.
export function BlocRow({ bloc, removable, onRename, onRecolour, onRemove }: BlocRowProps) {
  const [draft, setDraft] = useState<string | null>(null);
  return (
    <li className="flex items-center gap-3 border-b border-hairline py-2">
      <input
        type="color"
        value={bloc.colour}
        onChange={(event) => onRecolour(event.target.value)}
        aria-label={`Color de ${bloc.name}`}
        className="size-11 shrink-0 cursor-pointer rounded-sm border border-ink-muted-48 bg-canvas p-1"
      />
      <input
        type="text"
        value={draft ?? bloc.name}
        maxLength={BLOC_NAME_MAX}
        onChange={(event) => {
          setDraft(event.target.value);
          if (event.target.value.trim()) onRename(event.target.value);
        }}
        onBlur={() => setDraft(null)}
        aria-label={`Nombre de ${bloc.name}`}
        className="h-11 min-w-0 flex-1 rounded-sm border border-ink-muted-48 bg-canvas px-4 text-body text-ink"
      />
      <button
        type="button"
        onClick={onRemove}
        disabled={!removable}
        className="min-h-11 shrink-0 text-caption underline underline-offset-2 disabled:text-ink-muted-48 disabled:no-underline"
      >
        Quitar<span className="sr-only"> {bloc.name}</span>
      </button>
    </li>
  );
}
