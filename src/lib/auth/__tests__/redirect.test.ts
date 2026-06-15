import { describe, expect, it } from "vitest";

import { redirectToSameOrigin } from "@/lib/auth/redirect";

describe("redirectToSameOrigin", () => {
	it("sets a relative Location header", () => {
		const response = redirectToSameOrigin(
			"/auth?returnTo=%2Fcommunities%2Fcreate",
		);

		expect(response.status).toBe(307);
		expect(response.headers.get("Location")).toBe(
			"/auth?returnTo=%2Fcommunities%2Fcreate",
		);
	});

	it("rejects absolute and protocol-relative redirects", () => {
		expect(() => redirectToSameOrigin("https://0.0.0.0:8080/auth")).toThrow(
			"same-origin redirects",
		);
		expect(() => redirectToSameOrigin("//example.com/auth")).toThrow(
			"same-origin redirects",
		);
	});

	it("rejects backslash and control-character authority bypasses", () => {
		expect(() => redirectToSameOrigin("/\\example.com/auth")).toThrow(
			"same-origin redirects",
		);
		expect(() => redirectToSameOrigin("/\n/example.com/auth")).toThrow(
			"same-origin redirects",
		);
		expect(() => redirectToSameOrigin("/\t/example.com")).toThrow(
			"same-origin redirects",
		);
	});
});
