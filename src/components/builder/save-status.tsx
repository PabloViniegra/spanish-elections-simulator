import type { SaveStatus as Status } from "./use-autosave";

type SaveStatusProps = {
  status: Status;
  onRetry: () => void;
};

export function SaveStatus({ status, onRetry }: SaveStatusProps) {
  return (
    <div className="flex min-h-11 flex-wrap items-center gap-x-3 text-caption">
      <p role="status" className={status.kind === "error" ? "text-error" : "text-ink-muted-80"}>
        {status.kind === "saved" && "Guardado en tu perfil"}
        {status.kind === "pending" && "Cambios sin guardar"}
        {status.kind === "saving" && "Guardando…"}
        {status.kind === "error" && status.message}
      </p>
      {status.kind === "error" && (
        <button type="button" onClick={onRetry} className="min-h-11 text-ink underline underline-offset-4">
          Reintentar
        </button>
      )}
    </div>
  );
}
