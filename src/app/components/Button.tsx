import cn from "classnames";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
	variant?: "primary" | "secondary" | "ghost";
	size?: "sm" | "md" | "lg";
	children: React.ReactNode;
}

export default function Button({
	variant = "primary",
	size = "md",
	children,
	className = "",
	...props
}: ButtonProps) {
	const baseStyles =
		"font-medium transition-colors duration-200 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer";

	const variants = {
		primary: "bg-zinc-800 text-white hover:bg-zinc-950",
		secondary:
			"bg-white text-zinc-800 border border-zinc-300 hover:bg-zinc-50",
		ghost: "text-zinc-700 hover:bg-zinc-900 hover:text-white",
	};

	const sizes = {
		sm: "px-3 py-1.5 text-sm",
		md: "px-4 py-2 text-base",
		lg: "px-6 py-3 text-xl",
	};

	const combinedClassName = cn({
		[baseStyles]: true,
		[variants[variant]]: true,
		[sizes[size]]: true,
		[className]: className !== "",
	});

	return (
		<button className={combinedClassName} {...props}>
			{children}
		</button>
	);
}
