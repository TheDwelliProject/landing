import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
	requireAccessToken,
} from "@/lib/auth/route-utils";
import { createCommunityBodySchema } from "@/lib/communities/schemas";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const parsed = await parseJsonBody(request, createCommunityBodySchema);
	if (!parsed.ok) return parsed.response;

	try {
		const data = await callBackend<{
			id: string;
			name: string;
			status: string;
		}>("/v1/communities", {
			method: "POST",
			body: parsed.value,
			bearer: auth.value,
		});
		return jsendSuccess({
			community_id: data.id,
			name: data.name,
			status: data.status,
		});
	} catch (err) {
		return mapBackendError(err, "communities");
	}
}
