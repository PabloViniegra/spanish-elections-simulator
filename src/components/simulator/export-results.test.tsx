import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { ExportResults } from "./export-results";

describe("ExportResults", () => {
  const handlers = { onCsv: () => {}, onPng: () => {} };
  it("disables downloads while inputs are invalid", () => {
    const html = renderToStaticMarkup(<ExportResults {...handlers} stale busy={false} message="" />);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain('role="status" class="text-caption">Ajusta los porcentajes');
  });
  it("shows progress and prevents duplicate downloads", () => {
    const html = renderToStaticMarkup(<ExportResults {...handlers} stale={false} busy message="" />);
    expect(html.match(/disabled=""/g)).toHaveLength(2);
    expect(html).toContain("Preparando PNG…");
  });
  it("announces download feedback", () => {
    const html = renderToStaticMarkup(<ExportResults {...handlers} stale={false} busy={false} message="Descarga del CSV iniciada." />);
    expect(html).not.toContain('disabled=""');
    expect(html).toContain('role="status"');
    expect(html).toContain("Descarga del CSV iniciada.");
  });

  it("explains the CSV contents and percentage denominator", () => {
    const html = renderToStaticMarkup(<ExportResults {...handlers} stale={false} busy={false} message="" />);
    expect(html).toContain("por provincia y bloque");
    expect(html).toContain("voto válido");
    expect(html).toContain("voto en blanco y «Otros»");
    expect(html).not.toContain("por provincia y partido");
  });
});
