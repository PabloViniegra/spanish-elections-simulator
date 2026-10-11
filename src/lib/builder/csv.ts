// CSV as a spreadsheet writes it: fields split by a separator, quoted with
// double quotes when they hold the separator, a quote or a line break.

type CsvRecord = { fields: string[]; line: number };
// The records read, or the line of a quote that never closes.
type CsvParse = { records: CsvRecord[]; unclosed?: number };

// The records of a text with the line each starts on.
export function parseCsv(text: string, separator: string): CsvParse {
  const records: CsvRecord[] = [];
  let fields: string[] = [];
  let field = "";
  let quoted = false;
  let line = 1;
  let start = 1;
  let quoteLine = 0;

  for (let index = 0; index < text.length; index++) {
    const char = text[index];
    if (quoted) {
      if (char === '"' && text[index + 1] === '"') {
        field += '"';
        index++;
      } else if (char === '"') quoted = false;
      else {
        if (char === "\n") line++;
        field += char;
      }
    } else if (char === '"' && field === "") {
      quoted = true;
      quoteLine = line;
    } else if (char === separator) {
      fields.push(field);
      field = "";
    } else if (char === "\n" || char === "\r") {
      if (char === "\r" && text[index + 1] === "\n") index++;
      records.push({ fields: [...fields, field], line: start });
      fields = [];
      field = "";
      line++;
      start = line;
    } else field += char;
  }
  if (quoted) return { records, unclosed: quoteLine };
  if (field !== "" || fields.length > 0) records.push({ fields: [...fields, field], line: start });
  return { records };
}

function quote(field: string, separator: string) {
  return field.includes(separator) || /["\r\n]/.test(field) ? `"${field.replaceAll('"', '""')}"` : field;
}

export function toCsv(rows: readonly (readonly string[])[], separator: string) {
  return rows.map((row) => row.map((field) => quote(field, separator)).join(separator)).join("\r\n") + "\r\n";
}
