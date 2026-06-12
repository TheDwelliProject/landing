type LogoVariant = "orange" | "white-on-orange" | "white";

const SQUARE_PATH =
	"M 26 6 H 74 A 20 20 0 0 1 94 26 V 74 A 20 20 0 0 1 74 94 H 26 A 20 20 0 0 1 6 74 V 26 A 20 20 0 0 1 26 6 Z";

const PALETTES: Record<LogoVariant, { square: string; keyhole: string }> = {
	orange: { square: "#FF5703", keyhole: "#FFFFFF" },
	"white-on-orange": { square: "#FFFFFF", keyhole: "#FF5703" },
	white: { square: "#1C1B19", keyhole: "#FFFFFF" },
};

export function LogoMark({
	size = 22,
	variant = "orange",
	className = "",
}: {
	size?: number;
	variant?: LogoVariant;
	className?: string;
}) {
	const c = PALETTES[variant];
	return (
		<svg
			xmlns="http://www.w3.org/2000/svg"
			width={size}
			height={size}
			viewBox="0 0 100 100"
			aria-hidden="true"
			className={className}
		>
			<path d={SQUARE_PATH} fill={c.square} />
			<circle cx="50" cy="46" r="9" fill={c.keyhole} />
			<rect
				x="44.15"
				y="46"
				width="11.7"
				height="25.2"
				rx="5.85"
				fill={c.keyhole}
			/>
		</svg>
	);
}

export function Logo({
	size = 22,
	variant = "orange",
	wordmarkClassName = "",
	className = "",
}: {
	size?: number;
	variant?: LogoVariant;
	wordmarkClassName?: string;
	className?: string;
}) {
	return (
		<span className={`inline-flex items-center gap-2 ${className}`}>
			<LogoMark size={size} variant={variant} />
			<span
				className={`font-display font-extrabold tracking-tight ${wordmarkClassName}`}
			>
				dwelli
			</span>
		</span>
	);
}
