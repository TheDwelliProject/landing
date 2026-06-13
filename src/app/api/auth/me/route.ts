import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { JwtVerifierUnavailableError, verifyAccessJwt } from "@/lib/auth/jwt";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
} from "@/lib/auth/route-utils";

export const runtime = "nodejs";

type BackendMeResponse = {
	id: string;
	name: string | null;
};

export async function GET(request: NextRequest) {
	const token = request.cookies.get(ACCESS_COOKIE)?.value;
	if (!token) {
		return jsendError("unauthorized", 401, "Not signed in");
	}

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

		return jsendSuccess({
			user_id: data.id,
			superadmin: claims.superadmin ?? false,
			name: data.name,
		});
	} catch (err) {
		return mapBackendError(err);
	}
}
