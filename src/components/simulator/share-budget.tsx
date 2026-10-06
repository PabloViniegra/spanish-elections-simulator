import { FULL_SHARE } from "@/lib/scenario/types";
import { formatShare } from "./format";

// Basis points left for other parties once the blocs and blank vote are set;
// negative when they add up to more than 100%. Pinned so it stays in view
// while the sliders below move it. Over budget it offers to scale every party
// down in proportion instead of leaving that arithmetic to the user.
export function ShareBudget({ others, onRebalance }: { others: number; onRebalance: () => void }) {
  const over = others < 0;
  return (
    <div
      role={over ? "alert" : undefined}
      className={`sticky top-15 z-9 flex items-baseline justify-between gap-4 border-b bg-canvas py-2 text-caption lg:top-0 ${over ? "border-error text-error" : "border-hairline"}`}
    >
      {over ? (
        <>
          <span className="font-semibold">Los porcentajes suman {formatShare(FULL_SHARE - others)}. Baja alguno para ver el nuevo reparto.</span>
          <button type="button" onClick={onRebalance} className="-my-2 min-h-11 shrink-0 font-semibold underline underline-offset-2">
            Ajustar a 100 %
          </button>
        </>
      ) : (
        <>
          <span>Otros partidos, sin escaño en la simulación</span>
          <span className="shrink-0 font-semibold tabular-nums">{formatShare(others)}</span>
        </>
      )}
    </div>
  );
}
