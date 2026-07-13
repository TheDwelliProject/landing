import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { CommunityWizard } from "@/components/community-wizard";
import { Logo } from "@/components/logo";
import { RequireAuth } from "@/components/require-auth";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Create your community — Dwelli",
};

export default function WizardPage() {
	return (
		<div className="min-h-screen bg-background text-charcoal flex flex-col [color-scheme:light]">
			<Container as="header" className="pt-7">
				<div className="flex items-center justify-between gap-3">
					<Link href="/" className="flex items-center">
						<Logo
							size={22}
							variant="orange"
							wordmarkClassName="text-[18px] text-charcoal"
						/>
					</Link>
				</div>
			</Container>

			<main className="flex-1 flex items-center">
				<Container>
					<Suspense fallback={null}>
						<RequireAuth>
							<div className="max-w-[560px] mx-auto sm:mx-0">
								<div className="flex items-center gap-2 mb-7">
									<span className="w-1.5 h-1.5 rounded-full bg-orange" />
									<span className="font-mono uppercase tracking-[0.16em] text-[11px] text-orange">
										New community
									</span>
								</div>

								<h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
									Create your{" "}
									<span className="font-serif font-normal italic tracking-tight">
										community
									</span>
									.
								</h1>

								<CommunityWizard />
							</div>
						</RequireAuth>
					</Suspense>
				</Container>
			</main>
		</div>
	);
}
