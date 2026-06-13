import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { RequireAuth } from "@/components/require-auth";

export const metadata = {
	title: "List your property — Dwelli",
};

export default function CreateCommunityPage() {
	return (
		<div className="min-h-screen bg-charcoal text-white flex flex-col">
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
						Communities
					</span>
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
									List your{" "}
									<span className="font-serif font-normal italic tracking-tight">
										property
									</span>
									.
								</h1>

								<p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[460px]">
									The community-creation wizard lands here in
									a later stage. For now this is the post-auth
									destination for the &ldquo;List your
									property&rdquo; CTA.
								</p>
							</div>
						</RequireAuth>
					</Suspense>
				</Container>
			</main>
		</div>
	);
}
