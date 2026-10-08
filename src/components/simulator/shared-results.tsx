import type { ComponentProps } from "react";
import { ReadOnlyNotice } from "./read-only-notice";
import { SharedShares } from "./shared-shares";

type SharedResultsProps = ComponentProps<typeof SharedShares> & { next: string };

// A shared link signed out: the estimate first, then the way to make it one's own.
export function SharedResults({ next, ...estimate }: SharedResultsProps) {
  return (
    <>
      <SharedShares {...estimate} />
      <ReadOnlyNotice baseLabel={estimate.baseLabel} next={next} />
    </>
  );
}
