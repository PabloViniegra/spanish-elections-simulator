import type { ReactNode } from "react";

// One numbered heading of a legal page; its body is plain prose and lists.
export function LegalSection({ id, title, children }: { id: string; title: string; children: ReactNode }) {
  return (
    <section
      aria-labelledby={id}
      className="flex flex-col gap-4 border-t border-hairline pt-8 text-body text-ink-muted-80 [&_a]:text-ink [&_a]:underline [&_a]:underline-offset-4 [&_li]:pl-1 [&_strong]:font-semibold [&_strong]:text-ink [&_ul]:flex [&_ul]:list-disc [&_ul]:flex-col [&_ul]:gap-2 [&_ul]:pl-5"
    >
      <h2 id={id} className="text-tagline text-ink">
        {title}
      </h2>
      {children}
    </section>
  );
}
