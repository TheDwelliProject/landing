import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

describe("proxy", () => {
	it("redirects protected routes to refresh on the external origin", async () => {
		const response = await proxy(
			new NextRequest("http://0.0.0.0:8080/communities/create", {
				headers: {
					"x-forwarded-host": "app.dwelli.com",
					"x-forwarded-proto": "https",
				},
			}),
		);

		expect(response.status).toBe(307);
		expect(response.headers.get("Location")).toBe(
			"https://app.dwelli.com/api/auth/refresh?returnTo=%2Fcommunities%2Fcreate",
		);
	});
});
