import Link from "next/link";

import { Container } from "@/components/container";
import { Logo } from "@/components/logo";

/**
 * The dark in-app page header (logo + eyebrow label) shared by the authed and
 * superadmin destinations. Server component — no interactivity.
 */
export function AppHeader({ eyebrow }: { eyebrow: string }) {
	return (
		<Container as="header" className="pt-7">
			<div className="flex items-center gap-3">
				<Link href="/" className="flex items-center">
					<Logo
						size={22}
						variant="white-on-orange"
						wordmarkClassName="text-[18px] text-white"
					/>
				</Link>
				<span className="font-mono uppercase tracking-[0.16em] text-[10px] text-white/45">
					{eyebrow}
				</span>
			</div>
		</Container>
	);
}
