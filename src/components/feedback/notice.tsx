import type { ReactNode } from "react";

export type NoticeTone = "error" | "warning";

// Lasting messages tied to a form or a section; passing feedback is a toast
// (`notify`). The tone shows in the border, the tint and the icon's shape, so
// it does not rely on colour alone; the text stays in ink, like the page.
const tones = {
  error: { box: "border-error bg-error/5", icon: "text-error" },
  warning: { box: "border-warning bg-warning/5", icon: "text-warning" },
} satisfies Record<NoticeTone, { box: string; icon: string }>;

function ToneIcon({ tone }: { tone: NoticeTone }) {
  return (
    <svg
      aria-hidden="true"
      viewBox="0 0 20 20"
      className={`mt-0.5 size-4 shrink-0 fill-none stroke-current stroke-[1.8] ${tones[tone].icon}`}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      {tone === "error" && (
        <>
          <circle cx="10" cy="10" r="8" />
          <path d="M10 6v4.5M10 13.8v.2" />
        </>
      )}
      {tone === "warning" && <path d="M10 2.8 18 17H2zM10 8v4M10 14.6v.2" />}
    </svg>
  );
}

type NoticeProps = {
  tone: NoticeTone;
  role?: "alert" | "status";
  // Lets a form move focus to it after a rejected submit.
  focusable?: boolean;
  className?: string;
  children: ReactNode;
};

export function Notice({ tone, role, focusable, className = "", children }: NoticeProps) {
  return (
    <div
      role={role}
      tabIndex={focusable ? -1 : undefined}
      className={`settle flex gap-3 rounded-sm border px-4 py-3 text-caption text-ink ${tones[tone].box} ${className}`}
    >
      <ToneIcon tone={tone} />
      <div className="min-w-0 flex-1">{children}</div>
    </div>
  );
}
