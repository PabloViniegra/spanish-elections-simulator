import { describe, expect, it } from "vitest";
import { parseCsv, toCsv } from "./csv";

describe("parseCsv", () => {
  it("splits records and fields, with the line each record starts on", () => {
    expect(parseCsv("a;b\r\n1;2\n", ";")).toEqual({
      records: [
        { fields: ["a", "b"], line: 1 },
        { fields: ["1", "2"], line: 2 },
      ],
    });
  });

  it("reads quoted separators, quotes and line breaks", () => {
    const { records } = parseCsv('"x;y";"di ""no"""\n"a\nb";c\nz;w', ";");
    expect(records).toEqual([
      { fields: ["x;y", 'di "no"'], line: 1 },
      { fields: ["a\nb", "c"], line: 2 },
      { fields: ["z", "w"], line: 4 },
    ]);
  });

  it("reports a quote that never closes", () => {
    expect(parseCsv('a;b\n"c;d\n', ";").unclosed).toBe(2);
  });
});

describe("toCsv", () => {
  it("quotes only the fields that need it and reads back the same", () => {
    const rows = [["PP", "Junts, per Catalunya", 'di "sí"'], ["1", "2", "3"]];
    const text = toCsv(rows, ",");
    expect(text).toBe('PP,"Junts, per Catalunya","di ""sí"""\r\n1,2,3\r\n');
    expect(parseCsv(text, ",").records.map(({ fields }) => fields)).toEqual(rows);
  });
});
