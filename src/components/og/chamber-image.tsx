import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { ImageResponse } from "next/og";
import {
  HEMICYCLE_CENTER,
  HEMICYCLE_HEIGHT,
  HEMICYCLE_INNER_RADIUS,
  HEMICYCLE_OUTER_RADIUS,
  HEMICYCLE_WIDTH,
  hemicycleSeats,
  TOTAL_SEATS,
} from "@/lib/hemicycle-layout";
import { OG_SIZE } from "@/lib/site";

// Static SemiBold cut of the site's Hanken Grotesk: the image renderer reads neither
// woff2 nor variable fonts.
const font = await readFile(join(process.cwd(), "src/assets/fonts/hanken-grotesk-latin-600.ttf"));

const seats = hemicycleSeats();
const { x: cx, y: cy } = HEMICYCLE_CENTER;

// Seat `i` takes `fills[i]`, with the majority line down the middle.
function hemicycleSvg(fills: readonly string[]) {
  const dots = seats.map(({ x, y }, index) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.7" fill="${fills[index] ?? "#333333"}"/>`);
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 ${HEMICYCLE_WIDTH + 24} ${HEMICYCLE_HEIGHT + 12}">${dots.join("")}<path d="M${cx} -12V${cy - HEMICYCLE_OUTER_RADIUS - 5}M${cx} ${cy - HEMICYCLE_INNER_RADIUS + 5}V${HEMICYCLE_HEIGHT}" fill="none" stroke="#2997ff" stroke-width="0.6" stroke-dasharray="1.5 1.5"/></svg>`;
}

export const allSeats = (colour: string) => Array<string>(TOTAL_SEATS).fill(colour);

type ChamberImageProps = {
  title: string;
  fills: readonly string[];
  // Named next to their colour, so colour is not the only signal.
  legend?: readonly { name: string; colour: string; seats: number }[];
  hemicycleWidth?: number;
};

export function chamberImage({ title, fills, legend, hemicycleWidth = 720 }: ChamberImageProps, headers?: HeadersInit) {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "space-between",
        padding: "64px 64px 48px",
        background: "#000000",
        color: "#ffffff",
        fontFamily: "Hanken Grotesk",
      }}
    >
      <div style={{ fontSize: legend ? 64 : 88, letterSpacing: "-0.035em", lineHeight: 1 }}>{title}</div>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not served as HTML */}
      <img
        src={`data:image/svg+xml,${encodeURIComponent(hemicycleSvg(fills))}`}
        width={hemicycleWidth}
        height={(hemicycleWidth * (HEMICYCLE_HEIGHT + 12)) / (HEMICYCLE_WIDTH + 24)}
        alt=""
      />
      {legend && (
        <div style={{ display: "flex", flexWrap: "wrap", justifyContent: "center", gap: "8px 32px", fontSize: 30 }}>
          {legend.map(({ name, colour, seats }) => (
            <div key={name} style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ width: 20, height: 20, borderRadius: 10, background: colour }} />
              <span>{name}</span>
              <span style={{ color: "#cccccc" }}>{seats}</span>
            </div>
          ))}
        </div>
      )}
      <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#cccccc" }}>
        <span style={{ color: "#ffffff" }}>Simulador de Elecciones</span>
        <span>·</span>
        <span>Es una simulación, no una previsión.</span>
      </div>
    </div>,
    { ...OG_SIZE, headers, fonts: [{ name: "Hanken Grotesk", data: font, style: "normal", weight: 600 }] },
  );
}
