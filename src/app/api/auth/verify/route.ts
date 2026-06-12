import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { setAuthCookies, type TokenPair } from "@/lib/auth/cookies";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
	zodErrorToMessage,
} from "@/lib/auth/route-utils";
import { verifyBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

type VerifyResponse = TokenPair & { user_id: string; is_new_user?: boolean };

export async function POST(request: NextRequest) {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return jsendError("invalid_body", 400, "Malformed JSON");
	}

	const parsed = verifyBodySchema.safeParse(raw);
	if (!parsed.success) {
		return jsendError(
			"validation_failed",
			400,
			zodErrorToMessage(parsed.error),
		);
	}

	try {
		const data = await callBackend<VerifyResponse>("/v1/auth/verify", {
			method: "POST",
			body: parsed.data,
		});

		// is_new_user is true when this verify created the account — the client
		// uses it to route brand-new users into onboarding. Treat absence as
		// false so an older backend keeps returning users on the normal path.
		const response = jsendSuccess({
			user_id: data.user_id,
			is_new_user: data.is_new_user === true,
		});
		setAuthCookies(response, data);
		return response;
	} catch (err) {
		return mapBackendError(err);
	}
}
