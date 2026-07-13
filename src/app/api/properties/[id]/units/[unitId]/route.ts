import type { NextRequest } from "next/server";

import { callBackend } from "@/lib/auth/backend";
import {
	jsendSuccess,
	mapBackendError,
	parseJsonBody,
	requireAccessToken,
} from "@/lib/auth/route-utils";
import { updateUnitBodySchema, type Unit } from "@/lib/units/schemas";

export const runtime = "nodejs";

export async function PATCH(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; unitId: string }> },
) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const parsed = await parseJsonBody(request, updateUnitBodySchema);
	if (!parsed.ok) return parsed.response;

	const { id, unitId } = await params;

	try {
		const data = await callBackend<Unit>(
			`/v1/properties/${encodeURIComponent(id)}/units/${encodeURIComponent(unitId)}`,
			{
				method: "PATCH",
				body: parsed.value,
				bearer: auth.value,
			},
		);
		return jsendSuccess({ unit: data });
	} catch (err) {
		return mapBackendError(err, "properties/:id/units/:unitId");
	}
}

export async function DELETE(
	request: NextRequest,
	{ params }: { params: Promise<{ id: string; unitId: string }> },
) {
	const auth = requireAccessToken(request);
	if (!auth.ok) return auth.response;

	const { id, unitId } = await params;

	try {
		const data = await callBackend<Unit>(
			`/v1/properties/${encodeURIComponent(id)}/units/${encodeURIComponent(unitId)}`,
			{
				method: "DELETE",
				bearer: auth.value,
			},
		);
		return jsendSuccess({ unit: data });
	} catch (err) {
		return mapBackendError(err, "properties/:id/units/:unitId");
	}
}
