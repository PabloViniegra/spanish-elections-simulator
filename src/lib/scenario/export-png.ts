import type { Bloc } from "@/lib/elections/types";
import { HEMICYCLE_CENTER, HEMICYCLE_HEIGHT, HEMICYCLE_INNER_RADIUS, HEMICYCLE_OUTER_RADIUS, HEMICYCLE_WIDTH, hemicycleSeats, MAJORITY } from "@/lib/hemicycle-layout";

function wrapUrl(context: CanvasRenderingContext2D, url: string, maxWidth: number) {
  const tokens = url.match(/%[\da-f]{2}|./gi) ?? [];
  const lines: string[] = [];
  let line = "";
  for (const token of tokens) {
    if (line && context.measureText(line + token).width > maxWidth) {
      lines.push(line);
      line = token;
    } else {
      line += token;
    }
  }
  if (line) lines.push(line);
  return lines;
}

export async function hemicyclePng(ranked: readonly (Bloc & { seats: number })[], baseLabel: string, scenarioUrl: string) {
  await document.fonts.ready;
  const scale = 1080 / HEMICYCLE_WIDTH;
  const legendTop = 170 + HEMICYCLE_HEIGHT * scale + 65;
  const legendEnd = legendTop + 25 + Math.ceil(ranked.length / 2) * 40;
  const canvas = document.createElement("canvas");
  canvas.width = 1200;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Canvas is unavailable");
  const ink = getComputedStyle(document.body).color;
  const font = getComputedStyle(document.body).fontFamily;
  context.font = `15px ${font}`;
  const urlLines = wrapUrl(context, scenarioUrl, 1080);
  const disclaimerY = legendEnd + 42;
  const urlLabelY = disclaimerY + 44;
  const urlTop = urlLabelY + 26;
  const urlLineHeight = 22;
  canvas.height = Math.ceil(urlTop + urlLines.length * urlLineHeight + 36);
  context.fillStyle = "#ffffff";
  context.fillRect(0, 0, canvas.width, canvas.height);
  context.fillStyle = ink;
  context.font = `600 36px ${font}`;
  context.fillText("Simulador de Elecciones", 60, 70);
  context.font = `24px ${font}`;
  context.fillText(`Votos de partida: ${baseLabel}. Escaños de 2026.`, 60, 112);

  const owners = ranked.flatMap((bloc) => Array<Bloc>(bloc.seats).fill(bloc));
  context.save();
  context.translate(60, 170);
  context.scale(scale, scale);
  hemicycleSeats().forEach(({ x, y }, index) => {
    context.beginPath();
    context.arc(x, y, 2.6, 0, Math.PI * 2);
    context.fillStyle = owners[index]?.colour ?? "#e0e0e0";
    context.fill();
  });
  context.beginPath();
  context.moveTo(HEMICYCLE_CENTER.x, HEMICYCLE_CENTER.y - HEMICYCLE_OUTER_RADIUS - 4);
  context.lineTo(HEMICYCLE_CENTER.x, HEMICYCLE_CENTER.y - HEMICYCLE_INNER_RADIUS + 4);
  context.strokeStyle = ink;
  context.lineWidth = 0.6;
  context.setLineDash([2, 1.5]);
  context.stroke();
  context.restore();

  context.fillStyle = ink;
  context.font = `24px ${font}`;
  context.fillText(`Mayoría absoluta: ${MAJORITY} escaños`, 60, legendTop - 30);
  ranked.forEach((bloc, index) => {
    const x = 60 + index % 2 * 560;
    const y = legendTop + 25 + Math.floor(index / 2) * 40;
    context.fillStyle = bloc.colour;
    context.fillRect(x, y - 18, 18, 18);
    context.fillStyle = ink;
    context.fillText(`${bloc.name}: ${bloc.seats} escaños`, x + 30, y, 490);
  });
  context.font = `600 24px ${font}`;
  context.fillText("Es una simulación, no una previsión.", 60, disclaimerY);
  context.font = `15px ${font}`;
  context.fillText("Enlace al escenario. Une las líneas sin espacios para recuperarlo:", 60, urlLabelY);
  urlLines.forEach((line, index) => context.fillText(line, 60, urlTop + index * urlLineHeight));
  return new Promise<Blob>((resolve, reject) => {
    canvas.toBlob((blob) => blob ? resolve(blob) : reject(new Error("PNG encoding failed")), "image/png");
  });
}
