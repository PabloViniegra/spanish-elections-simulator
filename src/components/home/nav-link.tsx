import Link from "next/link";

export type NavPage = "home" | "simulator" | "how-it-works" | "profile";

// In the bar the indicator is a 2px rule on the bar's bottom edge: blue and
// permanent for the current page (plus aria-current), a white one that draws
// in from the left on hover. In the mobile panel the current page is underlined.
const BAR =
  "min-h-11 bg-[linear-gradient(currentColor,currentColor)] bg-[length:0_2px] bg-[position:0_100%] bg-no-repeat opacity-90 transition-[background-size,opacity] duration-300 ease-snappy hover:bg-[length:100%_2px] hover:opacity-100 motion-reduce:duration-0 aria-[current=page]:bg-[linear-gradient(var(--color-primary-on-dark),var(--color-primary-on-dark))] aria-[current=page]:bg-[length:100%_2px] aria-[current=page]:opacity-100";
const ROW =
  "min-h-12 w-fit aria-[current=page]:underline aria-[current=page]:decoration-primary-on-dark aria-[current=page]:decoration-2 aria-[current=page]:underline-offset-[6px]";

export function NavLink({
  href,
  page,
  current,
  variant,
  children,
}: {
  href: string;
  page: NavPage;
  current?: NavPage;
  variant: "bar" | "row";
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      aria-current={current === page ? "page" : undefined}
      className={`flex items-center ${variant === "bar" ? BAR : ROW}`}
    >
      {children}
    </Link>
  );
}
