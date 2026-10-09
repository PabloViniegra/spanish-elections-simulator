import { renderToStaticMarkup } from "react-dom/server";
import { describe, expect, it } from "vitest";
import { CoalitionCombinationsContainer } from "./coalition-combinations-container";
import { CoalitionCombinations } from "./coalition-combinations";

describe("coalition combinations", () => {
  it("does not compute or render the coalition list on the server", () => {
    const ranked = Array.from({ length: 16 }, (_, index) => ({ id: `n${index}`, name: `Partido ${index}`, colour: "#18307b", candidacyIds: [], seats: 22 }));
    const html = renderToStaticMarkup(<CoalitionCombinationsContainer ranked={ranked} />);
    expect(html).toContain("Combinaciones mínimas que llegan a 176");
    expect(html).not.toContain("<li");
    expect(html).not.toContain("<ul");
  });

  it("labels pagination and disables unavailable directions", () => {
    const html = renderToStaticMarkup(<CoalitionCombinations rows={[{ members: ["pp"], seats: 180 }]} names={new Map([["pp", "PP"]])} page={0} pages={2} total={51} onPage={() => {}} />);
    expect(html).toContain("Página 1 de 2");
    expect(html).toContain("51 combinaciones");
    expect(html.match(/disabled=""/g)).toHaveLength(1);
    expect(html).toContain("PP");
  });
});
