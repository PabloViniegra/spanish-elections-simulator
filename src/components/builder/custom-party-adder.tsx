import { useId, useState } from "react";
import { controlClassName } from "@/components/forms/field";
import { PARTY_NAME_MAX } from "@/lib/builder/schema";

type CustomPartyAdderProps = {
  full: boolean;
  onAdd: (name: string) => void;
};

// Not a nested form: Enter adds the party instead of creating the election.
export function CustomPartyAdder({ full, onAdd }: CustomPartyAdderProps) {
  const id = useId();
  const [name, setName] = useState("");
  const add = () => {
    if (!name.trim() || full) return;
    onAdd(name);
    setName("");
  };

  return (
    <div className="flex flex-col gap-2">
      <label htmlFor={id} className="px-1 text-caption font-semibold">
        Crear un partido propio
      </label>
      <div className="flex gap-2">
        <input
          id={id}
          value={name}
          maxLength={PARTY_NAME_MAX}
          onChange={(event) => setName(event.target.value)}
          onKeyDown={(event) => {
            if (event.key !== "Enter") return;
            event.preventDefault();
            add();
          }}
          autoComplete="off"
          className={controlClassName}
        />
        <button
          type="button"
          onClick={add}
          disabled={!name.trim() || full}
          className="min-h-11 shrink-0 rounded-sm bg-primary px-4 text-caption font-semibold text-on-primary disabled:bg-ink-muted-48"
        >
          Crear
        </button>
      </div>
    </div>
  );
}
