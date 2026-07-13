import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	requireAccessToken,
} from "@/lib/auth/route-utils";

export const runtime = "nodejs";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const { id } = await params;

	try {
		const data = await callBackend<{
			id: string;
			name: string;
			status: string;
			default_property_id: string;
		}>(`/v1/communities/${encodeURIComponent(id)}`, {
			bearer: auth.value,
		});
		return jsendSuccess({
			community_id: data.id,
			name: data.name,
			status: data.status,
			default_property_id: data.default_property_id ?? null,
		});
	} catch (err) {
		return mapBackendError(err, "communities/:id");
	}
}
