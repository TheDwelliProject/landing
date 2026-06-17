"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { useEffect } from "react";

import { useAuth } from "@/lib/auth/context";

type RequireAuthProps = {
	children: React.ReactNode;
	fallback?: React.ReactNode;
};

export function RequireAuth({ children, fallback = null }: RequireAuthProps) {
	const auth = useAuth();
	const router = useRouter();
	const pathname = usePathname();
	const searchParams = useSearchParams();

	useEffect(() => {
		if (auth.status !== "unauthenticated") return;
		const qs = searchParams.toString();
		const here = qs ? `${pathname}?${qs}` : pathname;
		router.replace(`/auth?returnTo=${encodeURIComponent(here)}`);
	}, [auth.status, pathname, router, searchParams]);

	if (auth.status === "error") {
		return (
			<p
				role="alert"
				className="text-[14px] leading-[1.55] text-white/65"
			>
				{auth.message}
			</p>
		);
	}

	if (auth.status !== "authenticated") return <>{fallback}</>;
	return <>{children}</>;
}
