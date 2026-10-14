import type { MouseEvent, ReactNode } from "react";

type ProvinceLinkProps = {
  href: string;
  code: string;
  current?: boolean;
  label?: string;
  className: string;
  onGo: (code: string) => void;
  children: ReactNode;
};

// A real link so it opens in a new tab; a plain click changes province in place and keeps unsaved edits.
export function ProvinceLink({ href, code, current, label, className, onGo, children }: ProvinceLinkProps) {
  const go = (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey || event.button !== 0) return;
    event.preventDefault();
    onGo(code);
  };
  return (
    <a href={href} onClick={go} aria-current={current ? "page" : undefined} aria-label={label} className={className}>
      {children}
    </a>
  );
}
