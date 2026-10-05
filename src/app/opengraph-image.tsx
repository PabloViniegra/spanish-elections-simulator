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
} from "@/lib/hemicycle-layout";

export const alt = "350 escaños. 52 repartos. Hemiciclo del Congreso con la mayoría absoluta en 176.";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Static SemiBold cut of the site's Inter: the image renderer reads neither
// woff2 nor variable fonts.
const inter = await readFile(join(process.cwd(), "src/assets/fonts/inter-latin-600.ttf"));

// The hero's finished count, without the motion.
const { x: cx, y: cy } = HEMICYCLE_CENTER;
const hemicycle = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="-12 -12 ${HEMICYCLE_WIDTH + 24} ${HEMICYCLE_HEIGHT + 12}">${hemicycleSeats()
  .map(({ x, y }) => `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="2.7" fill="#ffffff"/>`)
  .join("")}<path d="M${cx} -12V${cy - HEMICYCLE_OUTER_RADIUS - 5}M${cx} ${cy - HEMICYCLE_INNER_RADIUS + 5}V${HEMICYCLE_HEIGHT}" fill="none" stroke="#2997ff" stroke-width="0.6" stroke-dasharray="1.5 1.5"/></svg>`;

export default function Image() {
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
        fontFamily: "Inter",
      }}
    >
      <div style={{ fontSize: 88, letterSpacing: "-0.035em", lineHeight: 1 }}>350 escaños. 52 repartos.</div>
      {/* eslint-disable-next-line @next/next/no-img-element -- rendered to PNG, not served as HTML */}
      <img src={`data:image/svg+xml,${encodeURIComponent(hemicycle)}`} width={720} height={(720 * (HEMICYCLE_HEIGHT + 12)) / (HEMICYCLE_WIDTH + 24)} alt="" />
      <div style={{ display: "flex", gap: 16, fontSize: 26, color: "#cccccc" }}>
        <span style={{ color: "#ffffff" }}>Simulador de Elecciones</span>
        <span>·</span>
        <span>Es una simulación, no una previsión.</span>
      </div>
    </div>,
    { ...size, fonts: [{ name: "Inter", data: inter, style: "normal", weight: 600 }] },
  );
}
