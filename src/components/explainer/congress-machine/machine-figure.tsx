import type { Ref } from "react";
import { Line, Solid } from "@/components/iso/react/draw";
import { cssVar } from "@/lib/css-var";
import { Back, Bar, Base, Front, Hemicycle, type Seating, Tray } from "./art";
import { NEUTRAL } from "./constants";
import { BED_ART } from "./geometry";
import type { partsOf } from "./parts";
import { HEIGHT, WIDTH } from "./view";

type Parts = ReturnType<typeof partsOf>;

const tint = (colour: string) => ({
  ...cssVar("--anatomy-paper", colour),
  ...cssVar("--anatomy-top", `color-mix(in oklab, ${colour} 70%, white)`),
  ...cssVar("--anatomy-shade-3", `color-mix(in oklab, ${colour} 86%, white)`),
  ...cssVar("--anatomy-shade-2", colour),
  ...cssVar("--anatomy-shade-1", `color-mix(in oklab, ${colour} 88%, black)`),
  ...cssVar("--anatomy-shade-0", `color-mix(in oklab, ${colour} 76%, black)`),
});

type MachineFigureProps = {
  seats: Seating;
  parts: Parts;
  step: number;
  label: string;
  svgRef: Ref<SVGSVGElement>;
  barRef: Ref<SVGGElement>;
  barAt: string;
};

export function MachineFigure({ seats, parts, step, label, svgRef, barRef, barAt }: MachineFigureProps) {
  const won = parts.columns.map(() => 0);
  parts.coins.forEach((coin) => {
    if (coin.index < step) won[coin.column]++;
  });
  return (
    <svg ref={svgRef} className="iso-svg mx-auto min-w-[30rem] max-w-[64rem]" viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-label={label} focusable="false">
      <Base />
      <Hemicycle seats={seats} />
      <Back />
      {parts.columns.map((column, index) => (
        <g key={`${column.id}-${index}`} style={tint(column.excluded ? NEUTRAL : column.colour)} className={column.excluded ? "opacity-60" : undefined}>
          <Solid paths={column.body} tone="hi" />
          {column.notches.map((notch) => (
            <Line key={notch.divisor} d={notch.d} tone={notch.divisor <= won[index] ? "hi" : "faint"} />
          ))}
          {column.collar ? <Solid paths={column.collar} tone="hi" /> : null}
        </g>
      ))}
      <Front />
      <g ref={barRef} transform={barAt}>
        <Bar />
      </g>
      {BED_ART.trays.map((_, slot) => (
        <g key={slot}>
          <Tray slot={slot} />
          {parts.coins
            .filter((coin) => coin.column === slot)
            .map((coin) => (
              <g
                key={coin.index}
                data-on={coin.index < step}
                style={tint(parts.columns[coin.column].colour)}
                className="transition-[opacity,translate] duration-300 ease-out data-[on=false]:-translate-y-4 data-[on=false]:opacity-0 motion-reduce:transition-none"
              >
                <Solid paths={coin.paths} tone="hi" />
              </g>
            ))}
        </g>
      ))}
    </svg>
  );
}
