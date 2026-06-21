import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
	requireAccessToken,
} from "@/lib/auth/route-utils";
import { updateMeBodySchema } from "@/lib/auth/schemas";

export const runtime = "nodejs";

export async function PATCH(request: NextRequest) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const parsed = await parseJsonBody(request, updateMeBodySchema);
	if (!parsed.ok) return parsed.response;

	try {
		const data = await callBackend<{
			id: string;
			name: string;
			email: string;
		}>("/v1/me", {
			method: "PATCH",
			body: parsed.value,
			bearer: auth.value,
		});
		return jsendSuccess({
			user_id: data.id,
			name: data.name,
			email: data.email,
		});
	} catch (err) {
		return mapBackendError(err, "me");
	}
}
