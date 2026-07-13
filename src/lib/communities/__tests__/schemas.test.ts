import { describe, expect, it } from "vitest";

import { createCommunityBodySchema } from "@/lib/communities/schemas";

describe("createCommunityBodySchema", () => {
	it("accepts a valid body and trims whitespace", () => {
		const parsed = createCommunityBodySchema.parse({
			name: "  Harmony Estate  ",
			contact_email: "  admin@example.com  ",
			contact_phone: "  +2348012345678  ",
		});
		expect(parsed).toEqual({
			name: "Harmony Estate",
			contact_email: "admin@example.com",
			contact_phone: "+2348012345678",
		});
	});

	it("normalizes formatted contact phones before forwarding", () => {
		const parsed = createCommunityBodySchema.parse({
			name: "Harmony Estate",
			contact_email: "admin@example.com",
			contact_phone: "+234 801 234 5678",
		});
		expect(parsed.contact_phone).toBe("+2348012345678");
	});

	it("accepts and normalizes Nigerian local contact phones", () => {
		const parsed = createCommunityBodySchema.parse({
			name: "Harmony Estate",
			contact_email: "admin@example.com",
			contact_phone: "08012345678",
		});
		expect(parsed.contact_phone).toBe("+2348012345678");
	});

	it("rejects a name that's too short", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "H",
			contact_email: "admin@example.com",
			contact_phone: "+2348012345678",
		});
		expect(result.success).toBe(false);
	});

	it("rejects an empty name", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "",
			contact_email: "admin@example.com",
			contact_phone: "+2348012345678",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a name over 255 characters", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "a".repeat(256),
			contact_email: "admin@example.com",
			contact_phone: "+2348012345678",
		});
		expect(result.success).toBe(false);
	});

	it("rejects an invalid email", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "Harmony Estate",
			contact_email: "not-an-email",
			contact_phone: "+2348012345678",
		});
		expect(result.success).toBe(false);
	});

	it("rejects an invalid phone number", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "Harmony Estate",
			contact_email: "admin@example.com",
			contact_phone: "12345",
		});
		expect(result.success).toBe(false);
	});

	it("rejects a non-phone string", () => {
		const result = createCommunityBodySchema.safeParse({
			name: "Harmony Estate",
			contact_email: "admin@example.com",
			contact_phone: "not a phone",
		});
		expect(result.success).toBe(false);
	});
});
