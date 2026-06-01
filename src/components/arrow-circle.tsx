export default function ArrowCircle({
  className = "",
  bg = "bg-white/15",
  text = "text-white",
}: {
  className?: string;
  bg?: string;
  text?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bg} ${text} ${className}`}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 7h10M8 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}
