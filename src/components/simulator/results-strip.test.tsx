import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ResultsStrip } from "./results-strip";

const ranked = [
  { id: "pp", name: "PP", seats: 145, colour: "#1d84ce", candidacyIds: [] },
  { id: "psoe", name: "PSOE", seats: 120, colour: "#e00020", candidacyIds: [] },
];

describe("mobile result feedback", () => {
  it("shows an edited party even when it has no seats", () => {
    const html = renderToStaticMarkup(<ResultsStrip ranked={ranked} selected={new Set()} edited={{ name: "Nuevo", seats: 0 }} />);
    expect(html).toContain("Nuevo 0 escaños");
    expect(html).toContain('role="status"');
  });

  it("keeps the selected coalition ahead of the last edit", () => {
    const html = renderToStaticMarkup(<ResultsStrip ranked={ranked} selected={new Set(["pp", "psoe"])} edited={{ name: "PP", seats: 145 }} />);
    expect(html).toContain("Coalición 265");
    expect(html).not.toContain("PP 145 escaños");
  });

  it("labels stale results instead of implying a recalculation", () => {
    const html = renderToStaticMarkup(<ResultsStrip ranked={ranked} selected={new Set()} stale edited={{ name: "PP", seats: 145 }} />);
    expect(html).toContain("Último reparto válido.");
    expect(html).toContain("Sin actualizar");
  });
});
