import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
	title: "Dwelli",
	description: "The best way to manage your home",
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en" className="scroll-smooth">
			<body>{children}</body>
		</html>
	);
}
