import { NextResponse, type NextRequest } from "next/server";

const TEMPORARY_REDIRECT = 307;

/**
 * Build a redirect to a path on this app's own origin.
 *
 * `path` must be a root-relative absolute path ("/foo?bar"). It is resolved
 * against the app's external origin so the `Location` never points at the
 * internal container host (behind Railway, `request.url`/`nextUrl` can carry
 * the proxied-to address). A relative `Location` is not an option: Next.js
 * middleware normalizes the header through `new URL(location)` and throws on a
 * relative value, so the result must be absolute.
 *
 * The path guard rejects absolute, protocol-relative, backslash, and
 * control-character inputs so resolving against the origin can't be steered
 * off-origin into an open redirect. This is defense-in-depth: user-supplied
 * destinations must still pass `safeReturnTo` before reaching here.
 */
export function redirectToSameOrigin(
	request: NextRequest,
	path: string,
): NextResponse {
	// Browsers normalize backslashes to slashes and strip tab/newline/CR when
	// parsing URLs, so "/\\evil.com" or "/\nevil.com" can collapse into a
	// protocol-relative URL and escape the origin. Require a single leading "/"
	// not followed by "/" or "\\", and reject the stripped control characters.
	if (
		!path.startsWith("/") ||
		path[1] === "/" ||
		path[1] === "\\" ||
		/[\t\n\r]/.test(path)
	) {
		throw new Error("same-origin redirects must use an absolute path");
	}

	return NextResponse.redirect(new URL(path, originOf(request)), {
		status: TEMPORARY_REDIRECT,
	});
}

/**
 * The externally visible origin to resolve redirects against. Prefers the
 * configured canonical origin (`APP_ORIGIN`), which is the only trustworthy
 * source in production: `X-Forwarded-*` headers are attacker-controllable
 * unless the proxy strips them, so trusting them blindly is an open-redirect
 * vector. Falls back to the forwarded headers, then the request URL, for local
 * development where `APP_ORIGIN` is unset and no proxy is in front.
 *
 * Read lazily from `process.env` (not `@/lib/env`) because this module runs in
 * the edge proxy, like `jwt.ts`.
 */
function originOf(request: NextRequest): string {
	const configured = process.env.APP_ORIGIN;
	if (configured) {
		return new URL(configured).origin;
	}

	const host =
		firstForwardedValue(request.headers.get("x-forwarded-host")) ??
		firstForwardedValue(request.headers.get("host")) ??
		request.nextUrl.host;
	const proto =
		firstForwardedValue(request.headers.get("x-forwarded-proto")) ??
		request.nextUrl.protocol.replace(/:$/, "");
	return `${proto}://${host}`;
}

/**
 * `X-Forwarded-*` headers can carry a comma-separated chain
 * ("client, proxy1, proxy2"); the first value is the externally visible one.
 */
function firstForwardedValue(value: string | null): string | undefined {
	const first = value?.split(",")[0]?.trim();
	return first || undefined;
}
