import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { JwtVerifierUnavailableError, verifyAccessJwt } from "@/lib/auth/jwt";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
	requireAccessToken,
} from "@/lib/auth/route-utils";

export const runtime = "nodejs";

type BackendMeResponse = {
	id: string;
	name: string | null;
};

export async function GET(request: NextRequest) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;
	const token = auth.value;

	let claims;
	try {
		claims = await verifyAccessJwt(token);
	} catch (err) {
		if (err instanceof JwtVerifierUnavailableError) {
			return jsendError(
				"jwt_verifier_unavailable",
				503,
				"Authentication temporarily unavailable",
			);
		}
		return jsendError("unauthorized", 401, "Invalid token");
	}

	try {
		const data = await callBackend<BackendMeResponse>("/v1/me", {
			method: "GET",
			bearer: token,
		});

		// Identity + superadmin status must never be cached by the browser,
		// bfcache, or any intermediary — a cached copy could be served to a
		// different session.
		return jsendSuccess(
			{
				user_id: data.id,
				superadmin: claims.superadmin ?? false,
				name: data.name,
			},
			{ headers: { "Cache-Control": "no-store" } },
		);
	} catch (err) {
		return mapBackendError(err);
	}
}
