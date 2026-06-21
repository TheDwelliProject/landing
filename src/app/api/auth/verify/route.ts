import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { setAuthCookies, type TokenPair } from "@/lib/auth/cookies";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
} from "@/lib/auth/route-utils";
import { verifyBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

type VerifyResponse = TokenPair & {
	user_id: string;
	is_new_user: boolean;
	name: string | null;
};

export async function POST(request: NextRequest) {
	const parsed = await parseJsonBody(request, verifyBodySchema);
	if (!parsed.ok) return parsed.response;

	try {
		const data = await callBackend<VerifyResponse>("/v1/auth/verify", {
			method: "POST",
			body: parsed.value,
		});

		// is_new_user is true when this verify created the account — the client
		// uses it to route brand-new users into onboarding. Treat absence as
		// false so an older backend keeps returning users on the normal path.
		const response = jsendSuccess({
			user_id: data.user_id,
			is_new_user: data.is_new_user === true,
			name: data.name,
		});
		setAuthCookies(response, data);
		return response;
	} catch (err) {
		return mapBackendError(err, "verify");
	}
}
