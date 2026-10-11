import type { ComponentProps } from "react";
import { ProvinceStepper } from "./province-stepper";
import { SaveStatus } from "./save-status";
import type { ProvinceAllocation } from "./province-allocation";

type ProvinceToolbarProps = {
  allocation: ComponentProps<typeof ProvinceAllocation>;
  stepper: ComponentProps<typeof ProvinceStepper>;
  save: ComponentProps<typeof SaveStatus>;
};

export function ProvinceToolbar({ allocation, stepper, save }: ProvinceToolbarProps) {
  const winners = allocation.result.candidacies.filter(({ seats }) => seats > 0).sort((a, b) => b.seats - a.seats);
  const assigned = allocation.result.seats - allocation.result.vacantSeats;
  return (
    <div className="fixed inset-x-0 bottom-0 z-20 border-t border-hairline bg-canvas px-5 pt-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] sm:px-8 lg:static lg:col-start-1 lg:border-0 lg:p-0">
      <div className="relative flex min-w-0 items-center justify-between gap-3 lg:hidden">
        {/* Closes when another field takes the focus, so it never hides the
            vote being typed. Taps that focus nothing leave it open. */}
        <details className="min-w-0" onBlur={(event) => { if (event.relatedTarget && !event.currentTarget.contains(event.relatedTarget)) event.currentTarget.open = false; }}>
          <summary className="min-h-11 cursor-pointer py-3 text-caption font-semibold">Reparto · {assigned} {assigned === 1 ? "escaño" : "escaños"}</summary>
          <div className="absolute inset-x-0 bottom-full max-h-[40svh] overflow-y-auto border border-hairline bg-canvas p-4">
            <p className="mb-3 text-caption font-semibold">{allocation.provinceName}</p>
            {winners.length > 0 ? (
              <ul aria-label="Reparto rápido" aria-live="polite" className="flex flex-col gap-2">
                {winners.map(({ id, seats }) => (
                  <li key={id} className="flex min-w-0 justify-between gap-3 text-caption">
                    <span className="min-w-0 break-words [overflow-wrap:anywhere]">{allocation.blocs.get(id)?.name ?? id}</span>
                    <span className="shrink-0 tabular-nums">{seats} {seats === 1 ? "escaño" : "escaños"}</span>
                  </li>
                ))}
              </ul>
            ) : <p className="text-caption text-ink-muted-80">Todavía no hay escaños repartidos.</p>}
            <a href="#reparto" onClick={(event) => { const panel = event.currentTarget.closest("details"); if (panel) panel.open = false; }} className="mt-2 inline-flex min-h-11 items-center text-caption font-semibold underline underline-offset-4">Ver el reparto y el último escaño</a>
          </div>
        </details>
        <div className="min-w-0 max-w-[60%]"><SaveStatus {...save} /></div>
      </div>
      <ProvinceStepper {...stepper} />
    </div>
  );
}
