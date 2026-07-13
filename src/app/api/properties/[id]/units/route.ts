import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
	requireAccessToken,
} from "@/lib/auth/route-utils";
import { createUnitsBodySchema, type Unit } from "@/lib/units/schemas";

export const runtime = "nodejs";

export async function GET(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const { id } = await params;

	try {
		// Hardcode limit=100 and ignore any client query params: the backend
		// caps a single request at 20 labels and product caps a wizard
		// property at 20 units total, so one max-size page always holds the
		// full set. callBackend also drops the envelope-level pagination
		// `meta` by design, so there's nothing to forward anyway.
		const data = await callBackend<Unit[]>(
			`/v1/properties/${encodeURIComponent(id)}/units?limit=100`,
			{ bearer: auth.value },
		);
		return jsendSuccess({ units: data });
	} catch (err) {
		return mapBackendError(err, "properties/:id/units");
	}
}

export async function POST(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string }> },
) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const parsed = await parseJsonBody(request, createUnitsBodySchema);
	if (!parsed.ok) return parsed.response;

	const { id } = await params;

	try {
		const data = await callBackend<Unit[]>(
			`/v1/properties/${encodeURIComponent(id)}/units`,
			{
				method: "POST",
				body: parsed.value,
				bearer: auth.value,
			},
		);
		return jsendSuccess({ units: data });
	} catch (err) {
		return mapBackendError(err, "properties/:id/units");
	}
}
