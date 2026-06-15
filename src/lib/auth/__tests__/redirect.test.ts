import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { redirectToSameOrigin } from "@/lib/auth/redirect";

describe("redirectToSameOrigin", () => {
	it("resolves the path against the request origin", () => {
		const response = redirectToSameOrigin(
			new NextRequest("https://app.dwelli.com/communities/create"),
			"/auth?returnTo=%2Fcommunities%2Fcreate",
		);

		expect(response.status).toBe(307);
		expect(response.headers.get("Location")).toBe(
			"https://app.dwelli.com/auth?returnTo=%2Fcommunities%2Fcreate",
		);
	});

	it("prefers the external origin from X-Forwarded-* headers", () => {
		const response = redirectToSameOrigin(
			new NextRequest("http://0.0.0.0:8080/communities/create", {
				headers: {
					"x-forwarded-host": "app.dwelli.com",
					"x-forwarded-proto": "https",
				},
			}),
			"/communities",
		);

		expect(response.headers.get("Location")).toBe(
			"https://app.dwelli.com/communities",
		);
	});

	it("rejects absolute and protocol-relative redirects", () => {
		const request = new NextRequest("https://app.dwelli.com/");
		expect(() =>
			redirectToSameOrigin(request, "https://0.0.0.0:8080/auth"),
		).toThrow("same-origin redirects");
		expect(() =>
			redirectToSameOrigin(request, "//example.com/auth"),
		).toThrow("same-origin redirects");
	});

	it("rejects backslash and control-character authority bypasses", () => {
		const request = new NextRequest("https://app.dwelli.com/");
		expect(() =>
			redirectToSameOrigin(request, "/\\example.com/auth"),
		).toThrow("same-origin redirects");
		expect(() =>
			redirectToSameOrigin(request, "/\n/example.com/auth"),
		).toThrow("same-origin redirects");
		expect(() => redirectToSameOrigin(request, "/\t/example.com")).toThrow(
			"same-origin redirects",
		);
	});
});
