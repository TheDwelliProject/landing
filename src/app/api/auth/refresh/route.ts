import type { NextRequest } from "next/server";

import { BackendError, callBackend } from "@/lib/auth/backend";
import {
	clearAuthCookies,
	REFRESH_COOKIE,
	setAuthCookies,
	type TokenPair,
} from "@/lib/auth/cookies";
import { redirectToSameOrigin } from "@/lib/auth/redirect";
import { safeReturnTo } from "@/lib/auth/return-to";
import {
	codeToSessionReason,
	type SessionReason,
} from "@/lib/auth/session-reason";
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

// The GET form exists for the middleware-driven silent refresh: `proxy.ts`
// redirects an expired-but-refreshable session here, and a browser navigation
// cannot be redirected to a POST. Rotating tokens on GET is safe because the
// refresh cookie is `SameSite=Strict` (never sent on cross-site navigations, so
// it can't be triggered by another origin) and a rotation is self-healing — the
// response sets the new cookie pair before redirecting back to `returnTo`.
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

		const response = redirectToSameOrigin(request, returnTo);
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

function reasonForRefreshFailure(err: unknown): SessionReason | undefined {
	if (!(err instanceof BackendError)) return undefined;
	return codeToSessionReason(err.code);
}

function redirectToAuth(
	request: NextRequest,
	returnTo: string,
	reason?: SessionReason,
) {
	const params = new URLSearchParams({ returnTo });
	if (reason) params.set("reason", reason);
	return redirectToSameOrigin(request, `/auth?${params.toString()}`);
}
