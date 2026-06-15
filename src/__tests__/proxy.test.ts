import { NextRequest } from "next/server";
import { describe, expect, it } from "vitest";

import { proxy } from "@/proxy";

describe("proxy", () => {
	it("redirects protected routes with a same-origin relative Location", async () => {
		const response = await proxy(
			new NextRequest("https://0.0.0.0:8080/communities/create"),
		);

		expect(response.status).toBe(307);
		expect(response.headers.get("Location")).toBe(
			"/api/auth/refresh?returnTo=%2Fcommunities%2Fcreate",
		);
	});
});
