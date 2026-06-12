import Link from "next/link";
import { Logo } from "./logo";
import { CtaButton } from "./cta-button";
import { Container } from "./container";

const NAV_LINKS = [
	{ href: "#product", label: "Product" },
	{ href: "#pricing", label: "Pricing" },
	{ href: "#residents", label: "Residents" },
	{ href: "#company", label: "Company" },
];

export default function Navbar() {
	return (
		<Container className="pt-4">
			<nav className="bg-white rounded-full flex items-center justify-between pl-5 pr-3 h-[68px]">
				<Link href="/" className="flex items-center">
					<Logo
						size={22}
						variant="orange"
						wordmarkClassName="text-[18px] text-charcoal"
					/>
				</Link>
				<div className="hidden md:flex items-center gap-9 text-[14.5px] text-charcoal/85">
					{NAV_LINKS.map((l) => (
						<Link
							key={l.href}
							href={l.href}
							className="hover:text-charcoal transition-colors"
						>
							{l.label}
						</Link>
					))}
				</div>
				<div className="flex items-center gap-3">
					<Link
						href="/auth"
						className="hidden sm:inline-flex text-[14.5px] font-medium text-charcoal hover:text-charcoal/70 px-2"
					>
						Sign in
					</Link>
					<CtaButton href="/auth?intent=list-property" size="sm">
						List your property
					</CtaButton>
				</div>
			</nav>
		</Container>
	);
}
