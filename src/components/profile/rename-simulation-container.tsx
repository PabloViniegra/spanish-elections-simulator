"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { notify } from "@/components/feedback/notify";
import { useFocusOnError } from "@/components/forms/use-focus-on-error";
import { updateSimulation } from "@/lib/simulations/actions";
import type { SaveState } from "@/lib/simulations/forms";
import { RenameButton, RenameSimulation } from "./rename-simulation";

type RenameProps = { id: string; name: string };

// Mounted only while open, so a cancelled attempt leaves no error behind.
function RenameFormContainer({ id, name, onDone }: RenameProps & { onDone: () => void }) {
  const [state, action, pending] = useActionState(async (previous: SaveState, formData: FormData) => {
    const next = await updateSimulation(previous, formData);
    if (next?.saved) {
      notify.success({ title: "Nombre cambiado", description: `Ahora se llama «${next.saved}».` });
      onDone();
    }
    return next;
  }, undefined);
  const ref = useFocusOnError(state);
  return (
    <div ref={ref} className="contents">
      <RenameSimulation id={id} name={name} state={state} action={action} pending={pending} onCancel={onDone} />
    </div>
  );
}

export function RenameSimulationContainer({ id, name }: RenameProps) {
  const [editing, setEditing] = useState(false);
  const button = useRef<HTMLButtonElement>(null);
  const closed = useRef(false);
  // Back on the button once the form closes, so focus is not lost with it.
  useEffect(() => {
    if (editing || !closed.current) return;
    button.current?.focus();
  }, [editing]);
  if (!editing) return <RenameButton name={name} buttonRef={button} onClick={() => setEditing(true)} />;
  return (
    <RenameFormContainer
      id={id}
      name={name}
      onDone={() => {
        closed.current = true;
        setEditing(false);
      }}
    />
  );
}
