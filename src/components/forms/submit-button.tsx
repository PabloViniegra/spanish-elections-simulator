import { HemicycleGlyph } from "@/components/brand/hemicycle-glyph";

type SubmitButtonProps = {
  pending: boolean;
  label: string;
  pendingLabel: string;
};

export function SubmitButton({ pending, label, pendingLabel }: SubmitButtonProps) {
  return (
    <button
      type="submit"
      disabled={pending}
      className="group/cta inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-full bg-primary px-[22px] py-[11px] text-body text-on-primary transition-[scale,background-color] duration-150 ease-snappy enabled:hover:bg-primary-focus active:scale-[0.97] disabled:bg-ink-muted-48"
    >
      {pending ? pendingLabel : label}
      {!pending && <HemicycleGlyph />}
    </button>
  );
}
