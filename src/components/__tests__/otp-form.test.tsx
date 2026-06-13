import { describe, expect, it } from "vitest";

import { verifiedRedirectPath } from "@/components/otp-form";

describe("verifiedRedirectPath", () => {
	it("routes brand-new users to profile completion", () => {
		expect(
			verifiedRedirectPath({ is_new_user: true, name: null }, "/wizard"),
		).toBe("/onboarding/profile?returnTo=%2Fwizard");
	});

	it("routes existing users with a name to the safe return path", () => {
		expect(
			verifiedRedirectPath(
				{ is_new_user: false, name: "Ada Obi" },
				"/admin",
			),
		).toBe("/admin");
	});

	it("routes existing users with an incomplete profile to profile completion", () => {
		expect(
			verifiedRedirectPath(
				{ is_new_user: false, name: null },
				"/communities",
			),
		).toBe("/onboarding/profile?returnTo=%2Fcommunities");
	});

	it("falls back when the return path is not allowed", () => {
		expect(
			verifiedRedirectPath(
				{ is_new_user: false, name: "Ada Obi" },
				"https://example.com",
			),
		).toBe("/communities");
	});
});
