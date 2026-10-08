import { type PointerEvent, useRef } from "react";
import map from "@/data/map/provinces.json";
import type { Bloc } from "@/lib/elections/types";

// Ceuta and Melilla are a few pixels wide, so a dot marks them, with a wider
// invisible circle to take the tap: 24 px across on a 360 px phone.
export const CITY_CODES = new Set(["51", "52"]);
const CITY_HIT_RADIUS = 24;
// Ties: thin grey lines over a pale ground, the same swatch as the legend, so
// the provinces a bloc leads outright stay the loudest thing on the map. Who is
// tied is read in the province's seats, not guessed from stripe colours.
const TIE_PATTERN = "map-tie";
const STRIPE_GAP = 5;
const STRIPE_LINE = 1;
// Padlock for provinces locked by hand, centred on the origin.
const LOCK_BODY = "M-3.5,-0.5h7v5.5h-7z";
const LOCK_SHACKLE = "M-2,-0.5v-2a2,2 0 0 1 4,0v2";

type ProvinceMapProps = {
  // Blocs tied for the most seats in each province, by code.
  leaders: ReadonlyMap<string, readonly Bloc[]>;
  // Province pointed at, outlined thinly.
  active: string | null;
  // Province being edited in provincial mode, outlined thickly.
  selected: string | null;
  lockedCodes: ReadonlySet<string>;
  // Text alternative for the whole map.
  label: string;
  onActive: (code: string | null) => void;
  // A tap or click on a province, to edit it in provincial mode.
  onPick?: (code: string) => void;
  // A mouse click where nothing is edited: take the reader to the D'Hondt detail.
  onDetail?: (code: string) => void;
};

// FR-07: the 52 constituencies, Canary Islands in an inset. A mouse shows the
// province under it and clears it on leaving it; a tap pins it, and in
// national mode a second tap clears it. Seat ties are striped in grey, so no
// bloc wins a province by votes alone.
export function ProvinceMap({ leaders, active, selected, lockedCodes, label, onActive, onPick, onDetail }: ProvinceMapProps) {
  const pointer = useRef("mouse");
  const fill = (code: string) => {
    const blocs = leaders.get(code) ?? [];
    if (blocs.length === 0) return "var(--color-hairline)";
    return blocs.length === 1 ? blocs[0].colour : `url(#${TIE_PATTERN})`;
  };
  const leave = (event: PointerEvent) => {
    if (event.pointerType === "mouse") onActive(null);
  };
  const point = (code: string) => ({
    onPointerDown: (event: PointerEvent) => {
      pointer.current = event.pointerType;
    },
    onPointerEnter: (event: PointerEvent) => {
      if (event.pointerType === "mouse") onActive(code);
    },
    // Over the sea or Portugal the tooltip would name the last province.
    onPointerLeave: leave,
    onClick: () => {
      onActive(pointer.current !== "mouse" && active === code && !onPick ? null : code);
      if (onPick) onPick(code);
      else if (pointer.current === "mouse") onDetail?.(code);
    },
  });
  const outline = (code: string | null, width: number) => {
    const province = map.provinces.find((candidate) => candidate.code === code);
    if (!province) return null;
    // An ink line over a canvas halo stays visible on any bloc colour.
    return [
      { stroke: "var(--color-canvas)", width: width * 2.5 },
      { stroke: "var(--color-ink)", width },
    ].map(({ stroke, width: strokeWidth }) =>
      CITY_CODES.has(province.code) ? (
        <circle key={strokeWidth} cx={province.x} cy={province.y} r={7} fill="none" stroke={stroke} strokeWidth={strokeWidth} pointerEvents="none" />
      ) : (
        <path key={strokeWidth} d={province.d} fill="none" stroke={stroke} strokeWidth={strokeWidth} strokeLinejoin="round" pointerEvents="none" />
      ),
    );
  };

  return (
    <svg viewBox={`0 0 ${map.width} ${map.height}`} role="img" aria-label={label} className="w-full touch-manipulation">
      <defs>
        <pattern id={TIE_PATTERN} patternUnits="userSpaceOnUse" width={STRIPE_GAP} height={STRIPE_GAP} patternTransform="rotate(45)">
          <rect width={STRIPE_GAP} height={STRIPE_GAP} fill="var(--color-canvas-parchment)" />
          <rect width={STRIPE_LINE} height={STRIPE_GAP} fill="var(--color-ink-muted-48)" fillOpacity={0.55} />
        </pattern>
      </defs>
      <path d={map.inset} fill="none" stroke="var(--color-hairline)" strokeWidth={1} />
      {/* Under the provinces, so the wide tap circles only take taps at sea. */}
      {map.provinces
        .filter(({ code }) => CITY_CODES.has(code))
        .map(({ code, x, y }) => (
          <g key={code} className="cursor-pointer" {...point(code)}>
            <circle cx={x} cy={y} r={CITY_HIT_RADIUS} fill="transparent" />
            <circle cx={x} cy={y} r={5} fill={fill(code)} stroke="var(--color-ink)" strokeWidth={0.8} />
            {/* Too small to read once the map shrinks to a phone. */}
            <text x={code === "51" ? x - 10 : x + 10} y={y + 4} textAnchor={code === "51" ? "end" : "start"} fontSize={12} fill="var(--color-ink-muted-80)" className="max-sm:hidden">
              {code === "51" ? "Ceuta" : "Melilla"}
            </text>
          </g>
        ))}
      {map.provinces.map(({ code, d }) => (
        <path
          key={code}
          d={d}
          fill={fill(code)}
          stroke={(leaders.get(code)?.length ?? 0) > 1 ? "var(--color-ink-muted-48)" : "var(--color-canvas)"}
          strokeWidth={0.6}
          className="cursor-pointer"
          {...point(code)}
        />
      ))}
      {map.provinces
        .filter(({ code }) => lockedCodes.has(code))
        .map(({ code, x, y }) => (
          <g key={code} transform={`translate(${x} ${y}) scale(1.6)`} pointerEvents="none">
            <path d={`${LOCK_BODY}${LOCK_SHACKLE}`} fill="none" stroke="var(--color-canvas)" strokeWidth={3.5} strokeLinejoin="round" />
            <path d={LOCK_BODY} fill="var(--color-ink)" />
            <path d={LOCK_SHACKLE} fill="none" stroke="var(--color-ink)" strokeWidth={1.2} />
          </g>
        ))}
      {active !== selected && outline(active, 1.5)}
      {outline(selected, 3)}
    </svg>
  );
}
