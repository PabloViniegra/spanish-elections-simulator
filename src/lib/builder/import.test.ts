import { describe, expect, it } from "vitest";
import { CONSTITUENCY_CODES } from "@/lib/engine/constants";
import { provinces } from "@/lib/provinces";
import type { BuilderReference } from "./allocate";
import { clashingNames, csvTemplate, importCsv, importNewCsv, newCsvTemplate } from "./import";
import type { BuiltScenario } from "./types";

const reference: BuilderReference = {
  census: new Map(CONSTITUENCY_CODES.map((code) => [code, 1000])),
  catalog: new Map([["pnv", { id: "pnv", acronym: "PNV", name: "Partido Nacionalista Vasco", colour: "#2a8343", provinces: ["01", "20", "48"], lastElection: "2023-07" }]]),
};

const scenario: BuiltScenario = {
  schemaVersion: 1,
  seatTable: "2026",
  parties: [
    { id: "pnv", name: "PNV", colour: "#2a8343", catalogId: "pnv" },
    { id: "propio", name: "Mío; el bueno", colour: "#000000" },
  ],
  provinces: {},
};

const BASQUE = ["01", "20", "48"];
const nameOf = (code: string) => provinces.find((province) => province.code === code)!.name;
const HEADER = 'codigo_ine;provincia;PNV;"Mío; el bueno";blancos;nulos;votos_emitidos';
// A valid row: the PNV runs only where it ever ran.
const row = (code: string) => (BASQUE.includes(code) ? `${code};${nameOf(code)};100;200;10;5;315` : `${code};${nameOf(code)};;200;10;5;215`);
const file = (rows = CONSTITUENCY_CODES.map(row)) => [HEADER, ...rows].join("\n");
const withRow = (code: string, line: string) => file(CONSTITUENCY_CODES.map((each) => (each === code ? line : row(each))));
const issues = (text: string) => {
  const result = importCsv(text, scenario, reference, "2023");
  return result.ok ? [] : result.issues;
};

describe("importCsv", () => {
  it("reads all 52 constituencies, an empty cell meaning the party does not run", () => {
    const result = importCsv(file(), scenario, reference, "2023");
    expect(result.ok).toBe(true);
    if (!result.ok) return;
    expect(Object.keys(result.provinces)).toHaveLength(52);
    expect(result.provinces["48"]).toEqual({ votes: { pnv: 100, propio: 200 }, blank: 10, null: 5 });
    expect(result.provinces["28"]).toEqual({ votes: { propio: 200 }, blank: 10, null: 5 });
  });

  it("takes commas, a byte order mark, CRLF and trailing empty rows", () => {
    const text = "﻿" + file().replaceAll(";", ",").replace('"Mío, el bueno"', '"Mío; el bueno"').replaceAll("\n", "\r\n") + "\r\n,,,,,,\r\n";
    expect(issues(text)).toEqual([]);
  });

  it("reads back its own template once filled in", () => {
    const filled = { ...scenario, provinces: Object.fromEntries(CONSTITUENCY_CODES.map((code) => [code, { votes: { propio: 7 }, blank: 1, null: 0 }])) };
    expect(importCsv(csvTemplate(filled), filled, reference, "2023")).toEqual({ ok: true, provinces: filled.provinces });
  });

  it("rejects an empty file or one without the code column first", () => {
    expect(issues("")).toEqual([{ message: "El archivo está vacío." }]);
    expect(issues("provincia;codigo_ine\n")[0].message).toMatch(/codigo_ine/);
  });

  it("names unknown, repeated and missing columns", () => {
    expect(issues("codigo_ine;provincia;PNV;PNV;Bildu;blancos;nulos")).toEqual([
      { line: 1, column: "PNV", message: "La columna está repetida." },
      { line: 1, column: "Bildu", message: "No es ningún partido de tu lista ni una columna de la plantilla." },
      { line: 1, column: "Mío; el bueno", message: "Falta esta columna." },
      { line: 1, column: "votos_emitidos", message: "Falta esta columna." },
    ]);
  });

  it("refuses a list where two columns would share a name", () => {
    const twins = { ...scenario, parties: [...scenario.parties, { id: "pnv-2", name: "PNV ", colour: "#000000" }] };
    expect(clashingNames(twins.parties)).toEqual(["PNV"]);
    expect(importCsv(file(), twins, reference, "2023").ok).toBe(false);
  });

  it("checks codes, names, repeats and missing provinces", () => {
    const found = issues(file([row("01"), "53;Atlántida;;1;0;0;1", "02;albacete;;200;10;5;215", row("01")]));
    expect(found.slice(0, 3)).toEqual([
      { line: 3, column: "codigo_ine", message: "«53» no es el código INE de ninguna circunscripción; usa dos cifras, de 01 a 52." },
      { line: 4, province: "Albacete", column: "provincia", message: "«albacete» no coincide con el código 02; debe ser «Albacete»." },
      { line: 5, province: "Araba/Álava", column: "codigo_ine", message: "La provincia ya aparece en la fila 2." },
    ]);
    expect(found.slice(3)).toHaveLength(50);
    expect(found[3]).toEqual({ province: "Alicante/Alacant", message: "Falta esta provincia." });
  });

  it.each([
    ["45.210", "«45.210» no es un número entero; escribe solo cifras, sin puntos, comas ni espacios."],
    ["-3", "«-3» no es un número entero; escribe solo cifras, sin puntos, comas ni espacios."],
    ["1e3", "«1e3» no es un número entero; escribe solo cifras, sin puntos, comas ni espacios."],
    ["10000001", "10000001 supera el máximo de 10000000 votos."],
  ])("rejects %s votes for a party", (cell, message) => {
    expect(issues(withRow("28", `28;Madrid;;${cell};10;5;215`))).toEqual([{ line: 29, province: "Madrid", column: "Mío; el bueno", message }]);
  });

  it("requires blank, null and cast votes", () => {
    expect(issues(withRow("28", "28;Madrid;;200;;5;")).map(({ column, message }) => [column, message])).toEqual([
      ["blancos", "No puede estar vacía."],
      ["votos_emitidos", "No puede estar vacía."],
    ]);
  });

  it("keeps catalogue parties where they ran", () => {
    expect(issues(withRow("28", "28;Madrid;0;200;10;5;215"))).toEqual([
      { line: 29, province: "Madrid", column: "PNV", message: "Este partido nunca se ha presentado aquí; deja la celda vacía." },
    ]);
  });

  it("checks cast votes against the sum and the census, and that someone got votes", () => {
    expect(issues(withRow("28", "28;Madrid;;200;10;5;216"))[0].message).toBe("Indica 216, pero partidos, blancos y nulos suman 215.");
    expect(issues(withRow("28", "28;Madrid;;990;10;5;1005"))[0].message).toBe("1005 supera el censo de 2023, que es de 1000.");
    expect(issues(withRow("28", "28;Madrid;;0;10;5;15"))[0].message).toBe("Ningún partido tiene votos.");
  });

  it("flags rows of the wrong width and unclosed quotes", () => {
    expect(issues(withRow("28", "28;Madrid;;200;10;5"))).toEqual([{ line: 29, province: "Madrid", message: "Tiene 6 columnas y la cabecera 7." }]);
    expect(issues(`${HEADER}\n01;"Araba`)).toEqual([{ line: 2, message: "Unas comillas se abren y no se cierran." }]);
  });
});

describe("importNewCsv", () => {
  const catalog = [
    { id: "pnv", acronym: "PNV", name: "Partido Nacionalista Vasco", colour: "#2a8343", provinces: ["01", "20", "48"], lastElection: "2023-07" },
    { id: "pp", acronym: "PP", name: "Partido Popular", colour: "#1d84ce", provinces: CONSTITUENCY_CODES, lastElection: "2023-07" },
  ];
  const known: BuilderReference = { ...reference, catalog: new Map(catalog.map((party) => [party.id, party])) };
  const rows = CONSTITUENCY_CODES.map((code) => (BASQUE.includes(code) ? `${code};${nameOf(code)};100;200;10;5;315` : `${code};${nameOf(code)};;200;10;5;215`));
  const text = (head: string) => [head, ...rows].join("\n");

  it("takes the parties from the header, in its order, with their catalogue colours", () => {
    const result = importNewCsv(text("codigo_ine;provincia;PNV;PP;blancos;nulos;votos_emitidos"), catalog, known, "2023");
    expect(result.ok && result.parties).toEqual([
      { id: "pnv", name: "PNV", colour: "#2a8343", catalogId: "pnv" },
      { id: "pp", name: "PP", colour: "#1d84ce", catalogId: "pp" },
    ]);
    expect(result.ok && result.provinces["48"]).toEqual({ votes: { pnv: 100, pp: 200 }, blank: 10, null: 5 });
  });

  it("accepts only exact catalogue acronyms", () => {
    expect(importNewCsv(text("codigo_ine;provincia;PNV;pp;blancos;nulos;votos_emitidos"), catalog, known, "2023")).toEqual({
      ok: false,
      issues: [{ line: 1, column: "pp", message: "No es la sigla exacta de ningún partido del catálogo; consúltala en el buscador de «Elegir partidos y escribir los votos»." }],
    });
  });

  it("needs at least one party column and checks the rows as usual", () => {
    expect(importNewCsv("codigo_ine;provincia;blancos;nulos;votos_emitidos\n", catalog, known, "2023")).toEqual({
      ok: false,
      issues: [{ line: 1, message: "Añade al menos una columna de partido." }],
    });
    const wrong = importNewCsv(text("codigo_ine;provincia;PP;PNV;blancos;nulos;votos_emitidos"), catalog, known, "2023");
    expect(wrong.ok ? [] : wrong.issues[0].message).toBe("Este partido nunca se ha presentado aquí; deja la celda vacía.");
  });

  it("offers an empty template with the parties given", () => {
    expect(newCsvTemplate(catalog).split("\r\n").slice(0, 2)).toEqual(["﻿codigo_ine;provincia;PNV;PP;blancos;nulos;votos_emitidos", "01;Araba/Álava;;;;;"]);
  });
});

describe("csvTemplate", () => {
  it("lists the 52 constituencies with the votes typed so far", () => {
    const started = { ...scenario, provinces: { "48": { votes: { pnv: 3 }, blank: 1, null: 2 } } };
    const lines = csvTemplate(started).split("\r\n");
    expect(lines[0]).toBe(`﻿${HEADER}`);
    expect(lines).toHaveLength(54);
    expect(lines[1]).toBe("01;Araba/Álava;;;;;");
    expect(lines.find((line) => line.startsWith("48;"))).toBe("48;Bizkaia;3;;1;2;6");
  });
});
