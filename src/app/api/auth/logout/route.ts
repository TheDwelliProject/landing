import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { clearAuthCookies, REFRESH_COOKIE } from "@/lib/auth/cookies";
import { jsendSuccess } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const refreshToken = request.cookies.get(REFRESH_COOKIE)?.value;

	if (refreshToken) {
		try {
			await callBackend<unknown>("/v1/auth/logout", {
				method: "POST",
				body: { refresh_token: refreshToken },
			});
		} catch {
			// Best-effort: a backend error must not prevent us from clearing cookies.
		}
	}

	const response = jsendSuccess({ ok: true });
	clearAuthCookies(response);
	return response;
}
