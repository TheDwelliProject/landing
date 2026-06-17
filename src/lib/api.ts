import {
	codeToSessionReason,
	type SessionReason,
} from "@/lib/auth/session-reason";

export class ApiError extends Error {
	readonly code: string;
	readonly status: number;
	/** Structured error details forwarded from the backend (e.g. retry timing on 429s). */
	readonly data?: unknown;
	constructor(code: string, status: number, message: string, data?: unknown) {
		super(message);
		this.name = "ApiError";
		this.code = code;
		this.status = status;
		this.data = data;
	}

	/** Seconds until the tripped rate-limit window clears. Always present on 429s. */
	get retryAfterSeconds(): number | undefined {
		if (typeof this.data !== "object" || this.data === null)
			return undefined;
		const value = (this.data as { retry_after_seconds?: unknown })
			.retry_after_seconds;
		return typeof value === "number" && Number.isFinite(value) && value > 0
			? value
			: undefined;
	}
}

export class NetworkError extends Error {
	constructor(cause: unknown) {
		super("Network request failed");
		this.name = "NetworkError";
		this.cause = cause;
	}
}

type JSendBody =
	| { status: "success"; data: unknown }
	| { status: "error"; code: string; message: string; data?: unknown };

type RefreshResult = { ok: true } | { ok: false; code?: string };

/** Ceiling for a single browser→BFF round-trip before we treat it as a network failure. */
const CLIENT_TIMEOUT_MS = 20_000;

/** Attach an abort timeout to a request, merging with any caller-supplied signal. */
function withTimeout(init: RequestInit): RequestInit {
	const timeout = AbortSignal.timeout(CLIENT_TIMEOUT_MS);
	return {
		...init,
		signal: init.signal ? AbortSignal.any([init.signal, timeout]) : timeout,
	};
}

let refreshInFlight: Promise<RefreshResult> | null = null;

async function refreshOnce(): Promise<RefreshResult> {
	if (!refreshInFlight) {
		refreshInFlight = (async () => {
			try {
				const res = await fetch(
					"/api/auth/refresh",
					withTimeout({
						method: "POST",
						credentials: "same-origin",
					}),
				);
				const body = await readJSend(res);
				// Treat the refresh as successful only on an explicit success
				// envelope — a 2xx carrying `{status:"error"}` must not be read as a
				// fresh token, or we'd retry the original request straight into a
				// hard failure.
				if (res.ok && body?.status === "success") {
					return { ok: true } as const;
				}
				const code = body?.status === "error" ? body.code : undefined;
				return { ok: false, code } as const;
			} catch {
				return { ok: false } as const;
			} finally {
				refreshInFlight = null;
			}
		})();
	}
	return refreshInFlight;
}

function redirectToAuth(reason?: SessionReason): void {
	if (typeof window === "undefined") return;
	const here = window.location.pathname + window.location.search;
	const params = new URLSearchParams();
	if (reason) params.set("reason", reason);
	if (here && !here.startsWith("/auth")) {
		params.set("returnTo", here);
	}
	const qs = params.toString();
	window.location.assign(qs ? `/auth?${qs}` : "/auth");
}

async function readJSend(res: Response): Promise<JSendBody | undefined> {
	let text: string;
	try {
		text = await res.text();
	} catch (cause) {
		throw new NetworkError(cause);
	}
	if (!text) return undefined;
	try {
		return JSON.parse(text) as JSendBody;
	} catch {
		return undefined;
	}
}

function bodyToError(body: JSendBody | undefined, status: number): ApiError {
	if (body && body.status === "error") {
		return new ApiError(body.code, status, body.message, body.data);
	}
	return new ApiError("internal_error", status, "Unexpected server response");
}

export type ApiFetchOptions = RequestInit & {
	/** Set to true to skip the refresh-on-401 retry path (used by auth endpoints themselves). */
	skipRefresh?: boolean;
};

export async function apiFetch<T = unknown>(
	path: string,
	options: ApiFetchOptions = {},
): Promise<T> {
	const { skipRefresh, ...init } = options;
	return doFetch<T>(path, init, skipRefresh ?? false, false);
}

async function doFetch<T>(
	path: string,
	init: RequestInit,
	skipRefresh: boolean,
	isRetry: boolean,
): Promise<T> {
	let res: Response;
	try {
		res = await fetch(
			path,
			withTimeout({ ...init, credentials: "same-origin" }),
		);
	} catch (cause) {
		throw new NetworkError(cause);
	}

	if (res.status === 401 && !skipRefresh && !isRetry) {
		const body = await readJSend(res);
		// Any 401 means the access token was rejected (expired or otherwise
		// invalid). Attempt a single silent refresh regardless of the specific
		// error code — the backend may signal token expiry with codes other than
		// `unauthorized`, and a stale/absent refresh cookie just yields another
		// failure that routes the user to /auth.
		const refreshed = await refreshOnce();
		if (refreshed.ok) {
			return doFetch<T>(path, init, skipRefresh, true);
		}
		// Refresh failed -> force the user back to /auth with the right reason.
		// We still throw the original 401 so the caller's catch path runs, but the
		// navigation has already started by the time it does.
		redirectToAuth(codeToSessionReason(refreshed.code));
		throw bodyToError(body, res.status);
	}

	const body = await readJSend(res);

	if (!res.ok) {
		throw bodyToError(body, res.status);
	}

	if (body && body.status === "success") {
		return body.data as T;
	}
	return undefined as T;
}
