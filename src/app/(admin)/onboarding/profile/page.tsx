import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { ProfileForm } from "@/components/profile-form";
import { ProfilePhone } from "@/components/profile-phone";

export const metadata = {
	title: "What should we call you? — Dwelli",
	description: "One last detail — your name — and you're all set.",
};

export default function ProfileCompletionPage() {
	return (
		<div className="min-h-screen bg-charcoal text-white flex flex-col">
			<Container as="header" className="pt-7">
				<div className="flex items-center justify-between gap-3">
					<Link href="/" className="flex items-center">
						<Logo
							size={22}
							variant="white-on-orange"
							wordmarkClassName="text-[18px] text-white"
						/>
					</Link>
					<ProfilePhone />
				</div>
			</Container>

			<main className="flex-1 flex items-center">
				<Container>
					<div className="max-w-[460px] mx-auto sm:mx-0">
						<div className="flex items-center gap-2 mb-7">
							<span className="w-1.5 h-1.5 rounded-full bg-green" />
							<span className="font-mono uppercase tracking-[0.16em] text-[11px] text-green">
								Almost there · One detail
							</span>
						</div>

						<h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
							What should
							<br />
							we call{" "}
							<span className="font-serif font-normal italic tracking-tight">
								you
							</span>
							?
						</h1>

						<p className="mt-6 text-[16px] leading-[1.55] text-white/60 max-w-[340px]">
							Just your name — so your team and residents know
							who&rsquo;s who.
						</p>

						<Suspense fallback={null}>
							<ProfileForm />
						</Suspense>

						<p className="mt-7 font-mono uppercase tracking-[0.16em] text-[10px] text-white/30">
							You&rsquo;re signed in — you can finish this
							anytime.
						</p>
					</div>
				</Container>
			</main>
		</div>
	);
}
