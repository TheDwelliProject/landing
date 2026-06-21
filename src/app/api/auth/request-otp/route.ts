import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
} from "@/lib/auth/route-utils";
import { requestOtpBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const parsed = await parseJsonBody(request, requestOtpBodySchema);
	if (!parsed.ok) return parsed.response;

	try {
		const data = await callBackend<unknown>("/v1/auth/otp", {
			method: "POST",
			body: parsed.value,
		});
		return jsendSuccess(data ?? {});
	} catch (err) {
		return mapBackendError(err, "request-otp");
	}
}
