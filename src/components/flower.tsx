/** A scalloped 12-petal "flower" decoration used in the brutalist-playful design. */
export default function Flower({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  const petals = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 38;
    const cx = 60 + Math.cos(angle) * r;
    const cy = 60 + Math.sin(angle) * r;
    return <circle key={i} cx={cx} cy={cy} r={18} fill={color} />;
  });
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      {petals}
      <circle cx={60} cy={60} r={28} fill={color} />
    </svg>
  );
}
