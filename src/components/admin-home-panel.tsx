"use client";

import { usePathname, useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { useAuth } from "@/lib/auth/context";

export function AdminHomePanel() {
	const router = useRouter();
	const pathname = usePathname();
	const auth = useAuth();
	const [signingOut, setSigningOut] = useState(false);

	// These pages aren't wrapped in <RequireAuth>, so if the client session
	// resolves to unauthenticated (cookie expired or refresh failed since the
	// middleware pass) we send the user to sign in rather than leaving a
	// dead-end page with no way forward.
	const unauthenticated = auth.status === "unauthenticated";
	useEffect(() => {
		if (!unauthenticated) return;
		router.replace(`/auth?returnTo=${encodeURIComponent(pathname)}`);
	}, [unauthenticated, pathname, router]);

	if (auth.status === "error") {
		return (
			<p
				role="alert"
				className="mt-8 text-[14px] leading-[1.55] text-white/65"
			>
				{auth.message}
			</p>
		);
	}

	if (auth.status !== "authenticated") {
		return (
			<p className="mt-8 text-[14px] text-white/45 font-mono uppercase tracking-[0.16em]">
				Loading…
			</p>
		);
	}

	async function handleSignOut() {
		setSigningOut(true);
		await auth.signOut();
		router.replace("/auth");
	}

	return (
		<div className="mt-8 rounded-2xl border border-white/12 bg-white/5 p-5">
			<p className="font-mono uppercase tracking-[0.16em] text-[10px] text-white/45 mb-2">
				Signed in as
			</p>
			<p className="text-[15px] text-white/90 break-all">
				{auth.name ? auth.name : auth.userID}
			</p>
			{auth.superadmin && (
				<p className="mt-2 text-[12px] text-orange font-mono uppercase tracking-[0.16em]">
					Superadmin
				</p>
			)}
			<button
				type="button"
				onClick={handleSignOut}
				disabled={signingOut}
				className="mt-5 inline-flex items-center justify-center h-11 px-5 rounded-full text-[14px] font-semibold transition-colors bg-white/10 text-white hover:bg-white/15 disabled:opacity-60"
			>
				{signingOut ? "Signing out…" : "Sign out"}
			</button>
		</div>
	);
}
