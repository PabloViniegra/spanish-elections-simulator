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
      className="min-h-11 w-full rounded-full bg-primary px-[22px] py-[11px] text-body text-on-primary transition-[scale,background-color] duration-200 ease-snappy active:scale-[0.97] disabled:bg-ink-muted-48"
    >
      {pending ? pendingLabel : label}
    </button>
  );
}
