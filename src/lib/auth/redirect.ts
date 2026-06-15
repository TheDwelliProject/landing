import { NextResponse } from "next/server";

const TEMPORARY_REDIRECT = 307;

export function redirectToSameOrigin(path: string): NextResponse {
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

	return new NextResponse(null, {
		status: TEMPORARY_REDIRECT,
		headers: {
			Location: path,
		},
	});
}
