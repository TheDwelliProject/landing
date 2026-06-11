import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { OtpForm } from "@/components/otp-form";

const INTENT_LABELS: Record<string, string> = {
	"list-property": "List your property",
};

export const metadata = {
	title: "Enter your code — Dwelli",
	description:
		"We just texted you a six-digit code. Enter it to finish signing in.",
};

export default async function VerifyPage({
	searchParams,
}: {
	searchParams: Promise<{ intent?: string }>;
}) {
	const { intent } = await searchParams;
	const intentLabel = intent ? INTENT_LABELS[intent] : undefined;

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
					<div className="max-w-[460px] mx-auto sm:mx-0">
						<Suspense fallback={null}>
							<OtpForm intentLabel={intentLabel} />
						</Suspense>
					</div>
				</Container>
			</main>
		</div>
	);
}
