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

let refreshInFlight: Promise<RefreshResult> | null = null;

async function refreshOnce(): Promise<RefreshResult> {
	if (!refreshInFlight) {
		refreshInFlight = (async () => {
			try {
				const res = await fetch("/api/auth/refresh", {
					method: "POST",
					credentials: "same-origin",
				});
				if (res.ok) return { ok: true } as const;
				const body = await readJSend(res);
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

function reasonForRefreshFailure(
	code: string | undefined,
): "session-compromised" | "session-expired" | undefined {
	if (code === "refresh_token_reuse") return "session-compromised";
	if (code === "refresh_token_expired") return "session-expired";
	return undefined;
}

function redirectToAuth(
	reason?: "session-compromised" | "session-expired",
): void {
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
	const text = await res.text();
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
		res = await fetch(path, { ...init, credentials: "same-origin" });
	} catch (cause) {
		throw new NetworkError(cause);
	}

	if (res.status === 401 && !skipRefresh && !isRetry) {
		const body = await readJSend(res);
		if (body?.status === "error" && body.code === "unauthorized") {
			const refreshed = await refreshOnce();
			if (refreshed.ok) {
				return doFetch<T>(path, init, skipRefresh, true);
			}
			// Refresh failed -> force the user back to /auth with the right reason.
			// We still throw the original 401 so the caller's catch path runs, but the
			// navigation has already started by the time it does.
			redirectToAuth(reasonForRefreshFailure(refreshed.code));
		}
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
