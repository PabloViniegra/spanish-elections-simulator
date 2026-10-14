import type { ImportIssue } from "@/lib/builder/import";

export function CsvImportIssues({ issues }: { issues: readonly ImportIssue[] }) {
  return (
    <div className="settle flex min-w-0 flex-col gap-3">
      <p role="alert" className="text-caption font-semibold text-error">
        {issues.length === 1 ? "Hay un error" : `Hay ${issues.length} errores`}; no se ha importado nada.
      </p>
      <div className="max-h-96 overflow-auto border-y border-hairline">
        <table className="w-full text-caption">
          <caption className="sr-only">Errores del archivo por fila, provincia y columna</caption>
          <thead className="sticky top-0 bg-canvas text-left text-ink-muted-80">
            <tr className="border-b border-hairline">
              <th scope="col" className="py-2 pr-4 font-normal">Fila</th>
              <th scope="col" className="py-2 pr-4 font-normal">Provincia</th>
              <th scope="col" className="py-2 pr-4 font-normal">Columna</th>
              <th scope="col" className="py-2 font-normal">Problema</th>
            </tr>
          </thead>
          <tbody>
            {issues.map(({ line, province, column, message }, index) => (
              <tr key={index} className="border-b border-divider-soft align-top">
                <td className="py-2 pr-4 tabular-nums">{line ?? "—"}</td>
                <td className="py-2 pr-4">{province ?? "—"}</td>
                <td className="py-2 pr-4 break-words [overflow-wrap:anywhere]">{column ?? "—"}</td>
                <td className="py-2">{message}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
