"use client";

import { useTransition } from "react";
import { notify } from "@/components/feedback/notify";
import { deleteSimulation } from "@/lib/simulations/actions";
import { DeleteSimulation, LIST_HEADING_ID } from "./delete-simulation";

export function DeleteSimulationContainer({ id, name }: { id: string; name: string }) {
  const [pending, startTransition] = useTransition();
  const remove = () =>
    startTransition(async () => {
      const deleted = await deleteSimulation(id).catch(() => false);
      if (!deleted) {
        notify.error({ title: "No se pudo eliminar", description: "Comprueba tu conexión e inténtalo de nuevo." });
        return;
      }
      notify.success({ title: "Simulación eliminada", description: `«${name}» ya no está en tu perfil.` });
      document.getElementById(LIST_HEADING_ID)?.focus();
    });
  return <DeleteSimulation name={name} pending={pending} onDelete={remove} />;
}
