import "server-only";

import { env } from "@/lib/env";

export type JSendError = {
	status: "error";
	code: string;
	message: string;
	data?: unknown;
};

export class BackendError extends Error {
	readonly code: string;
	readonly status: number;
	/** Structured error details from the backend envelope (e.g. retry timing on 429s). */
	readonly data?: unknown;
	constructor(code: string, status: number, message: string, data?: unknown) {
		super(message);
		this.name = "BackendError";
		this.code = code;
		this.status = status;
		this.data = data;
	}
}

export class BackendNetworkError extends Error {
	constructor(cause: unknown) {
		super("Backend unreachable");
		this.name = "BackendNetworkError";
		this.cause = cause;
	}
}

/** Default ceiling for a single backend round-trip before we give up. */
const DEFAULT_TIMEOUT_MS = 15_000;

type CallOptions = Omit<RequestInit, "body"> & {
	body?: unknown;
	bearer?: string;
	/** Abort the backend call after this many ms (defaults to 15s). */
	timeoutMs?: number;
};

export async function callBackend<T>(
	path: string,
	options: CallOptions = {},
): Promise<T> {
	const {
		body,
		bearer,
		headers,
		signal,
		timeoutMs = DEFAULT_TIMEOUT_MS,
		...rest
	} = options;

	const finalHeaders = new Headers(headers);
	finalHeaders.set("Accept", "application/json");
	if (body !== undefined) {
		finalHeaders.set("Content-Type", "application/json");
	}
	if (bearer) {
		finalHeaders.set("Authorization", `Bearer ${bearer}`);
	}

	// Never let a hung backend stall the serverless function indefinitely. A
	// timeout surfaces as a BackendNetworkError (-> 502), same as a connection
	// failure, whether it happens before headers or while reading the body.
	const timeoutSignal = AbortSignal.timeout(timeoutMs);
	const finalSignal = signal
		? AbortSignal.any([signal, timeoutSignal])
		: timeoutSignal;

	let response: Response;
	try {
		response = await fetch(`${env.DWELLI_API_URL}${path}`, {
			...rest,
			headers: finalHeaders,
			body: body === undefined ? undefined : JSON.stringify(body),
			cache: "no-store",
			signal: finalSignal,
		});
	} catch (cause) {
		throw new BackendNetworkError(cause);
	}

	let text: string;
	try {
		text = await response.text();
	} catch (cause) {
		throw new BackendNetworkError(cause);
	}
	const parsed: unknown = text ? safeJsonParse(text) : undefined;

	if (!response.ok) {
		if (isJSendError(parsed)) {
			throw new BackendError(
				parsed.code,
				response.status,
				parsed.message,
				parsed.data,
			);
		}
		throw new BackendError(
			"internal_error",
			response.status,
			"Unexpected backend error",
		);
	}

	if (isJSendError(parsed)) {
		// A 2xx response carrying a JSend error envelope is a backend contract
		// violation. Surface it as a gateway error (502) rather than echoing the
		// 2xx status, which downstream callers would read as success-ish.
		throw new BackendError(parsed.code, 502, parsed.message, parsed.data);
	}

	if (isJSendSuccess(parsed)) {
		return parsed.data as T;
	}
	return parsed as T;
}

function safeJsonParse(text: string): unknown {
	try {
		return JSON.parse(text);
	} catch {
		return undefined;
	}
}

function isJSendError(value: unknown): value is JSendError {
	return (
		typeof value === "object" &&
		value !== null &&
		"status" in value &&
		(value as { status: unknown }).status === "error" &&
		typeof (value as { code?: unknown }).code === "string"
	);
}

function isJSendSuccess(
	value: unknown,
): value is { status: "success"; data: unknown } {
	return (
		typeof value === "object" &&
		value !== null &&
		"status" in value &&
		(value as { status: unknown }).status === "success" &&
		"data" in value
	);
}
