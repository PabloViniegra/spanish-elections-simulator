import type { ProvinceStatus } from "@/lib/builder/types";
import { formatShare, formatVotes } from "@/components/simulator/format";
import { statusLabels } from "./status-labels";

export const PROVINCE_HEADING_ID = "provincia";

type ProvinceHeadingProps = {
  name: string;
  position: number;
  seats: number;
  census: number;
  cast: number;
  status: ProvinceStatus;
  censusYear: string;
  outside: readonly string[];
};

const warnings = {
  empty: null,
  "over-census": "Hay más votos que electores en el censo. Corrígelo para completar la provincia.",
  "invalid-party": null,
  incomplete: "Escribe los votos de al menos un partido para completar la provincia.",
  complete: null,
} satisfies Record<ProvinceStatus, string | null>;

const list = new Intl.ListFormat("es", { type: "conjunction" });

function outsideWarning(outside: readonly string[]) {
  return outside.length === 1
    ? `${outside[0]} no se presentó nunca aquí. Desmárcalo para completar la provincia.`
    : `${list.format(outside)} no se presentaron nunca aquí. Desmárcalos para completar la provincia.`;
}

export function ProvinceHeading({ name, position, seats, census, cast, status, censusYear, outside }: ProvinceHeadingProps) {
  const warning = status === "invalid-party" ? outsideWarning(outside) : warnings[status];
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-col gap-1">
        <p className="text-caption text-ink-muted-80">Provincia {position} de 52</p>
        <h2 id={PROVINCE_HEADING_ID} tabIndex={-1} className="scroll-mt-6 text-display-md">
          {name}
        </h2>
      </div>
      <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-caption sm:grid-cols-4">
        <div>
          <dt className="text-ink-muted-80">Reparte</dt>
          <dd className="font-semibold">{seats === 1 ? "1 escaño" : `${seats} escaños`}</dd>
        </div>
        <div>
          <dt className="text-ink-muted-80">Censo de {censusYear}</dt>
          <dd className="font-semibold tabular-nums">{formatVotes(census)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted-80">Votos emitidos</dt>
          <dd className="font-semibold tabular-nums">{formatVotes(cast)}</dd>
        </div>
        <div>
          <dt className="text-ink-muted-80">Participación</dt>
          <dd className={`font-semibold tabular-nums ${status === "over-census" ? "text-error" : ""}`}>
            {census > 0 ? formatShare(Math.round((cast / census) * 10_000)) : "—"}
          </dd>
        </div>
      </dl>
      <p className="text-caption">
        <span className="font-semibold">{statusLabels[status]}.</span>{" "}
        {warning && <span className={status === "incomplete" ? "text-ink-muted-80" : "text-error"}>{warning}</span>}
      </p>
    </div>
  );
}
