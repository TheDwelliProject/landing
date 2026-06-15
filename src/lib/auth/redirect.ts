import { NextResponse, type NextRequest } from "next/server";

const TEMPORARY_REDIRECT = 307;

/**
 * Build a redirect to a path on this app's own origin.
 *
 * `path` must be a root-relative absolute path ("/foo?bar"). It is resolved
 * against the request's external origin so the `Location` never points at the
 * internal container host (behind Railway, `request.url`/`nextUrl` can carry
 * the proxied-to address). A relative `Location` is not an option: Next.js
 * middleware normalizes the header through `new URL(location)` and throws on a
 * relative value, so the result must be absolute.
 *
 * The path guard rejects absolute, protocol-relative, backslash, and
 * control-character inputs so resolving against the origin can't be steered
 * off-origin into an open redirect.
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
 * The externally visible origin of the request. Prefers the `X-Forwarded-*`
 * headers a reverse proxy (Railway) sets, falling back to the request URL for
 * local development where no proxy is in front.
 */
function originOf(request: NextRequest): string {
	const host =
		request.headers.get("x-forwarded-host") ??
		request.headers.get("host") ??
		request.nextUrl.host;
	const proto =
		request.headers.get("x-forwarded-proto") ??
		request.nextUrl.protocol.replace(/:$/, "");
	return `${proto}://${host}`;
}
