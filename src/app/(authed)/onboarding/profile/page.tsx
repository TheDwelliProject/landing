import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { ProfileForm } from "@/components/profile-form";
import { Metadata } from "next";

export const metadata: Metadata = {
	title: "Set up your profile — Dwelli",
	description: "One last step — your name and email — and you're all set.",
};

export default function ProfileCompletionPage() {
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
					<div className="max-w-[460px] mx-auto sm:mx-0">
						<div className="flex items-center gap-2 mb-7">
							<span className="w-1.5 h-1.5 rounded-full bg-green" />
							<span className="font-mono uppercase tracking-[0.16em] text-[11px] text-green">
								Profile details
							</span>
						</div>

						<h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
							Let&rsquo;s set up
							<br />
							your{" "}
							<span className="font-serif font-normal italic tracking-tight">
								profile
							</span>
						</h1>

						<p className="mt-6 text-[16px] leading-[1.55] text-[#4A463F] max-w-[340px]">
							Just your name and email so your team and residents
							know who&rsquo;s who.
						</p>

						<Suspense fallback={null}>
							<ProfileForm />
						</Suspense>
					</div>
				</Container>
			</main>
		</div>
	);
}
