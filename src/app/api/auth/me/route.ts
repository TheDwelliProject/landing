import type { NextRequest } from "next/server";

import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import { verifyAccessJwt } from "@/lib/auth/jwt";
import { jsendError, jsendSuccess } from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function GET(request: NextRequest) {
	const token = request.cookies.get(ACCESS_COOKIE)?.value;
	if (!token) {
		return jsendError("unauthorized", 401, "Not signed in");
	}

	let claims;
	try {
		claims = await verifyAccessJwt(token);
	} catch {
		return jsendError("unauthorized", 401, "Invalid token");
	}

	return jsendSuccess({
		user_id: claims.sub,
		superadmin: claims.superadmin ?? false,
	});
}
