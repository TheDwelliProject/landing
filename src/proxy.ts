import { NextResponse, type NextRequest } from "next/server";

import { ACCESS_COOKIE } from "@/lib/auth/cookie-names";
import { JwtVerifierUnavailableError, verifyAccessJwt } from "@/lib/auth/jwt";
import { redirectToSameOrigin } from "@/lib/auth/redirect";

const ADMIN_PREFIXES = [
	"/communities",
	"/onboarding",
	"/wizard",
	"/r",
	"/start-here",
];

const SUPERADMIN_PREFIXES = ["/admin"];

type Group = "admin" | "superadmin" | "public";

function classify(pathname: string): Group {
	if (
		SUPERADMIN_PREFIXES.some(
			(p) => pathname === p || pathname.startsWith(`${p}/`),
		)
	) {
		return "superadmin";
	}
	if (
		ADMIN_PREFIXES.some(
			(p) => pathname === p || pathname.startsWith(`${p}/`),
		)
	) {
		return "admin";
	}
	return "public";
}

export async function proxy(request: NextRequest) {
	const { pathname, search } = request.nextUrl;
	const group = classify(pathname);

	if (group === "public") {
		return NextResponse.next();
	}

	const token = request.cookies.get(ACCESS_COOKIE)?.value;
	let claims;
	try {
		claims = await verifyOrNull(token);
	} catch {
		return new NextResponse("Authentication temporarily unavailable", {
			status: 503,
		});
	}

	if (group === "admin") {
		if (!claims) {
			return redirectToRefresh(pathname + search);
		}
		return NextResponse.next();
	}

	// group === "superadmin"
	if (!claims) {
		return redirectToRefresh(pathname + search);
	}
	if (!claims.superadmin) {
		return redirectToSameOrigin("/communities");
	}
	return NextResponse.next();
}

async function verifyOrNull(token: string | undefined) {
	if (!token) return null;
	try {
		return await verifyAccessJwt(token);
	} catch (err) {
		if (err instanceof JwtVerifierUnavailableError) throw err;
		return null;
	}
}

function redirectToRefresh(returnTo: string) {
	const params = new URLSearchParams({ returnTo });
	return redirectToSameOrigin(`/api/auth/refresh?${params.toString()}`);
}

export const config = {
	matcher: [
		/*
		 * Match every request except for:
		 * - /api routes (BFF handles its own auth via cookies)
		 * - /_next static and image optimization paths
		 * - favicon / public assets with a file extension
		 */
		"/((?!api|_next/static|_next/image|favicon.ico|.*\\..*).*)",
	],
};
