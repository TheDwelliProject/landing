import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import { ACCESS_COOKIE } from "@/lib/auth/cookies";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
	zodErrorToMessage,
} from "@/lib/auth/route-utils";
import { updateMeBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
	const token = request.cookies.get(ACCESS_COOKIE)?.value;
	if (!token) {
		return jsendError("unauthorized", 401, "Not signed in");
	}

	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return jsendError("invalid_body", 400, "Malformed JSON");
	}

	const parsed = updateMeBodySchema.safeParse(raw);
	if (!parsed.success) {
		return jsendError(
			"validation_failed",
			400,
			zodErrorToMessage(parsed.error),
		);
	}

	try {
		const data = await callBackend<{ user_id: string; name: string }>(
			"/v1/me",
			{
				method: "PATCH",
				body: parsed.data,
				bearer: token,
			},
		);
		return jsendSuccess({ user_id: data.user_id, name: data.name });
	} catch (err) {
		return mapBackendError(err);
	}
}
