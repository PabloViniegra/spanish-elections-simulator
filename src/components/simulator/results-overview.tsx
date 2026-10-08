import type { ComponentProps } from "react";
import { ResultsHemicycle } from "./results-hemicycle";
import { summaryOf } from "./results-strip";

type ResultsOverviewProps = ComponentProps<typeof ResultsHemicycle> & {
  // The national table already names every bloc beside the hemicycle on wide
  // screens; without it the legend stays.
  legendOnWide: boolean;
};

// Wide screens: the headline the sticky strip gives on narrow ones, then the
// hemicycle and a legend that names every colour with its seats.
export function ResultsOverview({ legendOnWide, ...props }: ResultsOverviewProps) {
  const { ranked, selected, stale = false } = props;
  const { summary: headline } = summaryOf(ranked, selected ?? new Set());
  const fade = `transition-opacity duration-150 ${stale ? "opacity-65" : ""}`;
  return (
    <div className="flex flex-col gap-4">
      <p className={`hidden text-tagline tabular-nums lg:block ${fade}`}>{headline}</p>
      <ResultsHemicycle {...props} />
      <ul className={`flex flex-wrap justify-center gap-x-4 gap-y-1 text-caption tabular-nums ${legendOnWide ? "" : "lg:hidden"} ${fade}`}>
        {ranked.map((bloc) => (
          <li key={bloc.id} className="flex items-center gap-1.5">
            <span aria-hidden="true" className="size-3 rounded-full" style={{ backgroundColor: bloc.colour }} />
            {bloc.name} <span className="font-semibold">{bloc.seats}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}
