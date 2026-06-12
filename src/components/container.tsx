export function Container({
	as: Tag = "div",
	className = "",
	children,
}: {
	as?: "div" | "section" | "nav" | "main" | "header" | "footer";
	className?: string;
	children: React.ReactNode;
}) {
	return (
		<Tag
			className={`mx-auto w-full max-w-[1690px] px-6 sm:px-10 ${className}`}
		>
			{children}
		</Tag>
	);
}
