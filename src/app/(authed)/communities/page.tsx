import { Container } from "@/components/container";
import { AppHeader } from "@/components/app-header";
import { AdminHomePanel } from "@/components/admin-home-panel";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Communities — Dwelli",
};

export default function CommunitiesPage() {
	return (
		<div className="min-h-screen bg-charcoal text-white flex flex-col">
			<AppHeader eyebrow="Communities" />

			<main className="flex-1 flex items-center">
				<Container>
					<div className="max-w-[560px] mx-auto sm:mx-0">
						<div className="flex items-center gap-2 mb-7">
							<span className="w-1.5 h-1.5 rounded-full bg-green" />
							<span className="font-mono uppercase tracking-[0.16em] text-[11px] text-green">
								Admin home
							</span>
						</div>

						<h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
							Your{" "}
							<span className="font-serif font-normal italic tracking-tight">
								communities
							</span>
							.
						</h1>

						<p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[460px]">
							The real list of communities you administer will
							land here in a later stage. For now this is the
							post-auth destination so the middleware has
							something to gate on.
						</p>

						<AdminHomePanel />
					</div>
				</Container>
			</main>
		</div>
	);
}
