import { useRef } from "react";

type UndoNoticeProps = {
  notice: { message: string; undoable: boolean } | null;
  onUndo: () => void;
};

// FR-04: after a reset or a change of base, says what happened and offers to
// take it back. Focus moves to the notice when its button goes away.
export function UndoNotice({ notice, onUndo }: UndoNoticeProps) {
  const ref = useRef<HTMLDivElement>(null);
  return (
    <div ref={ref} tabIndex={-1} role="status" className="text-caption focus:outline-none">
      {notice && (
        <p className="settle flex flex-wrap items-baseline justify-between gap-x-4 border-y border-hairline">
          <span className="py-3">{notice.message}</span>
          {notice.undoable && (
            <button
              type="button"
              onClick={() => {
                onUndo();
                ref.current?.focus();
              }}
              className="min-h-11 shrink-0 font-semibold underline underline-offset-2"
            >
              Deshacer
            </button>
          )}
        </p>
      )}
    </div>
  );
}
