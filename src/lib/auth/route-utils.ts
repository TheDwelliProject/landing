import "server-only";

import { NextResponse, type NextRequest } from "next/server";
import type { ZodError, ZodType } from "zod";

import { BackendError, BackendNetworkError } from "@/lib/auth/backend";
import { ACCESS_COOKIE } from "@/lib/auth/cookie-names";

export type JSendBody<T> =
	| { status: "success"; data: T }
	| { status: "error"; code: string; message: string; data?: unknown };

export function jsendSuccess<T>(
	data: T,
	init?: ResponseInit,
): NextResponse<JSendBody<T>> {
	return NextResponse.json<JSendBody<T>>({ status: "success", data }, init);
}

export function jsendError(
	code: string,
	status: number,
	message: string,
	data?: unknown,
): NextResponse<JSendBody<never>> {
	return NextResponse.json<JSendBody<never>>(
		data === undefined
			? { status: "error", code, message }
			: { status: "error", code, message, data },
		{ status },
	);
}

export function mapBackendError(err: unknown): NextResponse<JSendBody<never>> {
	if (err instanceof BackendError) {
		// Preserve 4xx codes/messages the client UI keys off, but never echo a
		// backend 5xx message to the browser — it can leak internals. The code
		// still passes through; errors.ts maps these to a generic UI string.
		if (err.status >= 500) {
			return jsendError(
				err.code,
				err.status,
				"Something went wrong on our end.",
				err.data,
			);
		}
		return jsendError(err.code, err.status, err.message, err.data);
	}
	if (err instanceof BackendNetworkError) {
		return jsendError("internal_error", 502, "Backend unreachable");
	}
	return jsendError("internal_error", 500, "Unexpected error");
}

export function zodErrorToMessage(err: ZodError): string {
	const first = err.issues[0];
	if (!first) return "Invalid request";
	return first.message;
}

/** Result of a guard helper: either a parsed value or a ready-to-return error response. */
type GuardResult<T> =
	| { ok: true; value: T }
	| { ok: false; response: NextResponse<JSendBody<never>> };

/**
 * Parse + Zod-validate a JSON request body. Returns the typed data on success,
 * or a ready-made `invalid_body`/`validation_failed` response. Centralizes the
 * BFF route checklist (steps 2–3) so every route validates identically.
 */
export async function parseJsonBody<T>(
	request: NextRequest,
	schema: ZodType<T>,
): Promise<GuardResult<T>> {
	let raw: unknown;
	try {
		raw = await request.json();
	} catch {
		return {
			ok: false,
			response: jsendError("invalid_body", 400, "Malformed JSON"),
		};
	}

	const parsed = schema.safeParse(raw);
	if (!parsed.success) {
		return {
			ok: false,
			response: jsendError(
				"validation_failed",
				400,
				zodErrorToMessage(parsed.error),
			),
		};
	}

	return { ok: true, value: parsed.data };
}

/**
 * Require the access-token cookie on an authenticated BFF route. Returns the
 * token, or a ready-made 401 response when it's absent.
 */
export function requireAccessToken(request: NextRequest): GuardResult<string> {
	const token = request.cookies.get(ACCESS_COOKIE)?.value;
	if (!token) {
		return {
			ok: false,
			response: jsendError("unauthorized", 401, "Not signed in"),
		};
	}
	return { ok: true, value: token };
}
