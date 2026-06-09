import Link from "next/link";

type Variant = "primary" | "secondary" | "light";
type Size = "sm" | "md";

const STYLES: Record<Variant, string> = {
  primary: "bg-orange text-white hover:bg-orange/90",
  secondary:
    "bg-transparent text-charcoal border border-charcoal/15 hover:bg-charcoal/5",
  light: "bg-white text-charcoal hover:bg-white/90",
};

const SIZES: Record<Size, string> = {
  sm: "h-[42px] px-5 text-[14.5px] font-semibold",
  md: "h-14 px-7 text-[16.5px] font-semibold",
};

export function CtaButton({
  children,
  href = "#list",
  variant = "primary",
  size = "md",
  showArrow = true,
  className = "",
  fullWidth = false,
}: {
  children: React.ReactNode;
  href?: string;
  variant?: Variant;
  size?: Size;
  showArrow?: boolean;
  className?: string;
  fullWidth?: boolean;
}) {
  return (
    <Link
      href={href}
      className={`inline-flex items-center justify-center gap-2 rounded-full transition-colors whitespace-nowrap ${
        STYLES[variant]
      } ${SIZES[size]} ${fullWidth ? "w-full" : ""} ${className}`}
    >
      <span>{children}</span>
      {showArrow && (
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M3 8h10M9 4l4 4-4 4"
            stroke="currentColor"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      )}
    </Link>
  );
}
