import { Dots, Line, Solid } from "@/components/iso/react/draw";
import { cssVar } from "@/lib/css-var";
import { BAR_ART, BASE_ART, BED_ART, FRAME_ART, HEMI_ART } from "./geometry";
import type { SeatArt } from "./seats";

export type Seating = { main: SeatArt[][]; flank: SeatArt[][] };

type Label = (typeof BASE_ART)["label"];

function LabelPlate({ label }: { label: Label }) {
  return (
    <>
      <Solid paths={label.plate} tone="mid" />
      <Line d={label.inset} tone="faint" />
      <Line d={label.rules} tone="lo" />
      <Dots points={label.screws} size={0.45} tone="mid" />
    </>
  );
}

const SEAT_STATES = [
  "[&_[data-slot]:not([data-state])]:[--cap:color-mix(in_oklab,var(--seat)_24%,white)]",
  "[&_[data-slot]:not([data-state])]:[--side:color-mix(in_oklab,var(--seat)_34%,white)]",
  "[&_[data-state=wait]]:[--cap:white]",
  "[&_[data-state=wait]]:[--side:var(--color-hairline)]",
  "[&_[data-state=on]]:[--cap:color-mix(in_oklab,var(--seat)_78%,white)]",
  "[&_[data-state=on]]:[--side:var(--seat)]",
].join(" ");

function Seat({ seat }: { seat: SeatArt }) {
  const { cx, top, bottom, rx, ry } = seat;
  const left = Math.round((cx - rx) * 100) / 100;
  const right = Math.round((cx + rx) * 100) / 100;
  return (
    <g data-slot={seat.slot} data-code={seat.code} style={cssVar("--seat", seat.colour)}>
      <path
        className="fill-(--side) stroke-(--anatomy-mid) [stroke-width:.4] transition-[fill] duration-500"
        d={`M${left} ${top}V${bottom}A${rx} ${ry} 0 0 0 ${right} ${bottom}V${top}Z`}
      />
      <ellipse className="fill-(--cap) stroke-(--anatomy-mid) [stroke-width:.4] transition-[fill] duration-500" cx={cx} cy={top} rx={rx} ry={ry} />
    </g>
  );
}

const Row = ({ seats }: { seats: SeatArt[] }) => seats.map((seat) => <Seat key={seat.slot} seat={seat} />);

export function Base() {
  return (
    <g>
      <path className="iso-halo" d={BASE_ART.halo} />
      {BASE_ART.feet.map(([flange, foot], index) => (
        <g key={index}>
          <Solid paths={flange} tone="lo" />
          <Solid paths={foot} tone="lo" />
        </g>
      ))}
      <Solid paths={BASE_ART.slab} tone="lo" />
      <Line d={BASE_ART.groove} tone="faint" />
      <Line d={BASE_ART.screws.rings} tone="lo" />
      <Dots points={BASE_ART.screws.dots} size={0.5} tone="mid" />
      <LabelPlate label={BASE_ART.label} />
    </g>
  );
}

export function Hemicycle({ seats }: { seats: Seating }) {
  return (
    <g className={SEAT_STATES}>
      <Solid paths={HEMI_ART.plinth} tone="mid" />
      <Line d={HEMI_ART.plinthEdge} tone="faint" />
      <Line d={HEMI_ART.floor} tone="faint" />
      {HEMI_ART.main.map((_, index) => HEMI_ART.main.length - 1 - index).map((row) => (
        <g key={`main-${row}`}>
          <Solid paths={HEMI_ART.main[row]} tone="mid" />
          <Row seats={seats.main[row]} />
        </g>
      ))}
      <Solid paths={HEMI_ART.mesaStep} tone="mid" />
      <Solid paths={HEMI_ART.mesa} tone="mid" />
      <Solid paths={HEMI_ART.bench} tone="mid" />
      <Solid paths={HEMI_ART.tribuna} tone="mid" />
      {HEMI_ART.flank.map((band, row) => (
        <g key={`flank-${row}`}>
          <Solid paths={band} tone="mid" />
          <Row seats={seats.flank[row]} />
        </g>
      ))}
    </g>
  );
}

export function Back() {
  return (
    <g>
      <Solid paths={BED_ART.slab} tone="lo" />
      <Line d={BED_ART.groove} tone="faint" />
      <Line d={BED_ART.screws.rings} tone="lo" />
      <Dots points={BED_ART.screws.dots} size={0.45} tone="mid" />
      <LabelPlate label={BED_ART.label} />
      {BED_ART.sockets.map((socket, index) => (
        <Solid key={index} paths={socket} tone="lo" />
      ))}
      <Dots points={BED_ART.socketScrews} size={0.4} tone="mid" />
      {FRAME_ART.feet.map((foot, index) => (
        <Solid key={index} paths={foot} tone="lo" />
      ))}
      <Dots points={FRAME_ART.footScrews} size={0.4} tone="mid" />
      <Solid paths={FRAME_ART.posts[0]} tone="mid" />
      <Solid paths={FRAME_ART.strip} tone="lo" />
      <Line d={FRAME_ART.minor} tone="lo" />
      <Line d={FRAME_ART.major} tone="mid" />
      <Solid paths={FRAME_ART.stop} tone="hi" />
      <Line d={FRAME_ART.stopLine} tone="hi" />
    </g>
  );
}

export function Front() {
  return (
    <g>
      <Solid paths={FRAME_ART.posts[1]} tone="mid" />
      <Line d={FRAME_ART.postSeams} tone="faint" />
      <Solid paths={FRAME_ART.bearing} tone="mid" />
      <Solid paths={FRAME_ART.screw} tone="mid" crease="none" />
      <Line d={FRAME_ART.screwThread} tone="lo" />
      <Solid paths={FRAME_ART.beam} tone="mid" />
      <Line d={FRAME_ART.beamSeam} tone="faint" />
      <Dots points={FRAME_ART.beamScrews} size={0.45} tone="mid" />
      <Solid paths={FRAME_ART.wheelNeck} tone="mid" />
      <Solid paths={FRAME_ART.wheel} tone="mid" />
      <Line d={FRAME_ART.wheelKnurl} tone="lo" />
      <Line d={FRAME_ART.hub} tone="mid" />
    </g>
  );
}

export function Bar() {
  return (
    <g>
      {BAR_ART.feelers.map((feeler, index) => (
        <Solid key={index} paths={feeler} tone="mid" />
      ))}
      <Solid paths={BAR_ART.bar} tone="hi" lit />
      <Line d={BAR_ART.edge} tone="lit" />
      {BAR_ART.carriages.map((carriage, index) => (
        <Solid key={index} paths={carriage} tone="mid" />
      ))}
      <Dots points={BAR_ART.carriageScrews} size={0.4} tone="mid" />
      {BAR_ART.knobs.map((knob, index) => (
        <Solid key={index} paths={knob} tone="mid" />
      ))}
      <Solid paths={BAR_ART.nut} tone="mid" />
      <Dots points={BAR_ART.nutDots} size={0.4} tone="mid" />
    </g>
  );
}

export function Tray({ slot }: { slot: number }) {
  return (
    <>
      <Solid paths={BED_ART.trays[slot]} tone="lo" />
      <Line d={BED_ART.trayWells[slot]} tone="faint" />
    </>
  );
}
