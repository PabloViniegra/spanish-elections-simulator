import { IMPORT_MAX_BYTES } from "@/lib/builder/import";

export type CsvFile = { name: string; text: string } | { name: string; refused: string };

export async function readCsvFile(file: File): Promise<CsvFile> {
  if (!file.name.toLowerCase().endsWith(".csv")) return { name: file.name, refused: "El archivo debe ser un .csv." };
  if (file.size > IMPORT_MAX_BYTES) return { name: file.name, refused: `Pesa más de ${IMPORT_MAX_BYTES / 1000} kB; la plantilla de 52 provincias ocupa mucho menos.` };
  return { name: file.name, text: await file.text() };
}

export function downloadCsv(text: string, name: string) {
  const url = URL.createObjectURL(new Blob([text], { type: "text/csv;charset=utf-8" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  window.setTimeout(() => URL.revokeObjectURL(url));
}
