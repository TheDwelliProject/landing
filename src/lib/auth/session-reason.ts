// Shared, side-effect-free mapping from a backend refresh error code to the UI
// "reason" shown on the sign-in page. Lives in its own module (no `server-only`
// / no client-only imports) so both the client refresh path (`@/lib/api`) and
// the server refresh route can use the same source of truth instead of keeping
// two copies that drift.

export type SessionReason = "session-compromised" | "session-expired";

export function codeToSessionReason(
	code: string | undefined,
): SessionReason | undefined {
	if (code === "refresh_token_reuse") return "session-compromised";
	if (code === "refresh_token_expired") return "session-expired";
	return undefined;
}
