import type { Bloc } from "@/lib/elections/types";
import { formatShare } from "./format";

type OffTargetWarningProps = {
  blocs: readonly Bloc[];
  // Blocs pulled off their target (P-05, P-07), with the share reached.
  offTarget: readonly { blocId: string; requested: number; reached: number }[];
};

export function OffTargetWarning({ blocs, offTarget }: OffTargetWarningProps) {
  if (offTarget.length === 0) return null;
  const nameOf = new Map(blocs.map((bloc) => [bloc.id, bloc.name]));
  return (
    <div role="status" className="settle rounded-sm border border-error p-3 text-caption">
      <p className="font-semibold">No se pueden cumplir todos los porcentajes.</p>
      <p className="text-ink-muted-80">
        Algún partido solo se presenta en ciertas provincias, o las provincias fijadas a mano no dejan sitio para tantos
        votos. El reparto usa:{" "}
        {offTarget
          .map(({ blocId, requested, reached }) => `${nameOf.get(blocId)} ${formatShare(reached)} (pides ${formatShare(requested)})`)
          .join(", ")}
        .
      </p>
    </div>
  );
}
