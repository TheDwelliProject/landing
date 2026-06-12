import { NextResponse, type NextRequest } from "next/server";

import { BackendError, callBackend } from "@/lib/auth/backend";
import {
	clearAuthCookies,
	REFRESH_COOKIE,
	setAuthCookies,
	type TokenPair,
} from "@/lib/auth/cookies";
import { safeReturnTo } from "@/lib/auth/return-to";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
} from "@/lib/auth/route-utils";

export const runtime = "nodejs";

const INVALID_REFRESH_CODES = new Set([
	"invalid_refresh_token",
	"refresh_token_reuse",
	"refresh_token_expired",
	"unauthorized",
]);

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;
	if (!refreshToken) {
		const response = jsendError(
			"invalid_refresh_token",
			401,
			"No refresh token",
		);
		clearAuthCookies(response);
		return response;
	}

	try {
		const data = await callBackend<TokenPair>("/v1/auth/refresh", {
			method: "POST",
			body: { refresh_token: refreshToken },
		});

		const response = jsendSuccess({ ok: true });
		setAuthCookies(response, data);
		return response;
	} catch (err) {
		const response = mapBackendError(err);
		if (shouldClearAuthCookies(err)) {
			clearAuthCookies(response);
		}
		return response;
	}
}

export async function GET(request: NextRequest) {
	const returnTo = safeReturnTo(request.nextUrl.searchParams.get("returnTo"));
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

	if (!refreshToken) {
		const response = redirectToAuth(request, returnTo);
		clearAuthCookies(response);
		return response;
	}

	try {
		const data = await callBackend<TokenPair>("/v1/auth/refresh", {
			method: "POST",
			body: { refresh_token: refreshToken },
		});

		const response = NextResponse.redirect(new URL(returnTo, request.url));
		setAuthCookies(response, data);
		return response;
	} catch (err) {
		if (shouldClearAuthCookies(err)) {
			const response = redirectToAuth(
				request,
				returnTo,
				reasonForRefreshFailure(err),
			);
			clearAuthCookies(response);
			return response;
		}

		return redirectToAuth(request, returnTo);
	}
}

function shouldClearAuthCookies(err: unknown): boolean {
	return (
		err instanceof BackendError &&
		(INVALID_REFRESH_CODES.has(err.code) ||
			err.status === 401 ||
			err.status === 403)
	);
}

function reasonForRefreshFailure(
	err: unknown,
): "session-compromised" | "session-expired" | undefined {
	if (!(err instanceof BackendError)) return undefined;
	if (err.code === "refresh_token_reuse") return "session-compromised";
	if (err.code === "refresh_token_expired") return "session-expired";
	return undefined;
}

function redirectToAuth(
	request: NextRequest,
	returnTo: string,
	reason?: "session-compromised" | "session-expired",
) {
	const url = new URL("/auth", request.url);
	url.searchParams.set("returnTo", returnTo);
	if (reason) url.searchParams.set("reason", reason);
	return NextResponse.redirect(url);
}
