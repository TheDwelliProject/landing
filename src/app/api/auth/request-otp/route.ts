import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendError,
	jsendSuccess,
	mapBackendError,
	zodErrorToMessage,
} from "@/lib/auth/route-utils";
import { requestOtpBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return jsendError("invalid_body", 400, "Malformed JSON");
	}

	const parsed = requestOtpBodySchema.safeParse(raw);
	if (!parsed.success) {
		return jsendError(
			"validation_failed",
			400,
			zodErrorToMessage(parsed.error),
		);
	}

	try {
		const data = await callBackend<unknown>("/v1/auth/otp", {
			method: "POST",
			body: parsed.data,
		});
		return jsendSuccess(data ?? {});
	} catch (err) {
		return mapBackendError(err);
	}
}
