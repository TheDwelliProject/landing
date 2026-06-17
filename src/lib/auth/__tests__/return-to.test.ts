import { describe, expect, it } from "vitest";

import { ADMIN_PREFIXES, SUPERADMIN_PREFIXES } from "@/proxy";
import { ALLOWED_RETURN_PREFIXES, safeReturnTo } from "@/lib/auth/return-to";

const FALLBACK = "/communities";

describe("safeReturnTo", () => {
	it("falls back when the value is empty", () => {
		expect(safeReturnTo(null)).toBe(FALLBACK);
		expect(safeReturnTo(undefined)).toBe(FALLBACK);
		expect(safeReturnTo("")).toBe(FALLBACK);
	});

	it("allows an exact allowlisted prefix and its sub-paths", () => {
		expect(safeReturnTo("/communities")).toBe("/communities");
		expect(safeReturnTo("/communities/create")).toBe("/communities/create");
		expect(safeReturnTo("/admin/queue")).toBe("/admin/queue");
	});

	it("preserves the query string and hash on an allowed path", () => {
		expect(safeReturnTo("/wizard?step=2#top")).toBe("/wizard?step=2#top");
	});

	it("falls back for paths outside the allowlist", () => {
		expect(safeReturnTo("/")).toBe(FALLBACK);
		expect(safeReturnTo("/auth")).toBe(FALLBACK);
		expect(safeReturnTo("/settings")).toBe(FALLBACK);
		// A prefix must be a full segment — "/communities-evil" must not match.
		expect(safeReturnTo("/communities-evil")).toBe(FALLBACK);
	});

	it("rejects absolute and protocol-relative URLs (open-redirect vectors)", () => {
		expect(safeReturnTo("https://evil.com/communities")).toBe(FALLBACK);
		expect(safeReturnTo("//evil.com")).toBe(FALLBACK);
		expect(safeReturnTo("http://evil.com")).toBe(FALLBACK);
		// A would-be escape that still resolves to a foreign origin.
		expect(safeReturnTo("https://evil.com\\@dwelli.local/admin")).toBe(
			FALLBACK,
		);
	});
});

describe("route-prefix invariant", () => {
	it("keeps proxy protected prefixes in sync with the return-to allowlist", () => {
		// CLAUDE.md hard invariant: every protected prefix in proxy.ts must be a
		// permitted return-to target, or users can't land back where they came
		// from after sign-in (and vice versa).
		const protectedPrefixes = new Set([
			...ADMIN_PREFIXES,
			...SUPERADMIN_PREFIXES,
		]);
		expect(protectedPrefixes).toEqual(new Set(ALLOWED_RETURN_PREFIXES));
	});
});
