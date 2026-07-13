import { describe, expect, it } from "vitest";

import {
	addUnitsFormSchema,
	createUnitsBodySchema,
	unitLabelSchema,
	updateUnitBodySchema,
} from "@/lib/units/schemas";

describe("unitLabelSchema", () => {
	it("trims surrounding whitespace", () => {
		expect(unitLabelSchema.parse("  Flat 1  ")).toBe("Flat 1");
	});

	it("rejects an empty label", () => {
		expect(unitLabelSchema.safeParse("").success).toBe(false);
	});

	it("rejects a whitespace-only label", () => {
		expect(unitLabelSchema.safeParse("   ").success).toBe(false);
	});

	it("rejects a label over 255 characters", () => {
		expect(unitLabelSchema.safeParse("a".repeat(256)).success).toBe(false);
	});

	it("accepts a label of exactly 255 characters", () => {
		const label = "a".repeat(255);
		expect(unitLabelSchema.parse(label)).toBe(label);
	});
});

describe("addUnitsFormSchema", () => {
	it("accepts a valid label and count", () => {
		const result = addUnitsFormSchema.safeParse({
			label: "Flat",
			count: 3,
		});
		expect(result.success).toBe(true);
	});

	it("rejects a count of 0", () => {
		expect(
			addUnitsFormSchema.safeParse({ label: "Flat", count: 0 }).success,
		).toBe(false);
	});

	it("rejects a count of 21", () => {
		expect(
			addUnitsFormSchema.safeParse({ label: "Flat", count: 21 }).success,
		).toBe(false);
	});

	it("rejects a non-integer count", () => {
		expect(
			addUnitsFormSchema.safeParse({ label: "Flat", count: 2.5 }).success,
		).toBe(false);
	});

	it("rejects a non-number count", () => {
		expect(
			addUnitsFormSchema.safeParse({ label: "Flat", count: "3" }).success,
		).toBe(false);
	});

	it("rejects a label that's too long once numbered", () => {
		// 254 + 1 (" ") + 1 ("2") = 256 > 255
		const label = "a".repeat(254);
		const result = addUnitsFormSchema.safeParse({ label, count: 2 });
		expect(result.success).toBe(false);
		if (!result.success) {
			expect(result.error.issues[0].path).toEqual(["label"]);
		}
	});

	it("accepts the same label at count 1 since it stays bare", () => {
		const label = "a".repeat(254);
		const result = addUnitsFormSchema.safeParse({ label, count: 1 });
		expect(result.success).toBe(true);
	});
});

describe("createUnitsBodySchema", () => {
	it("rejects an empty array", () => {
		expect(createUnitsBodySchema.safeParse({ labels: [] }).success).toBe(
			false,
		);
	});

	it("rejects 21 labels", () => {
		const labels = Array.from({ length: 21 }, (_, i) => `Flat ${i + 1}`);
		expect(createUnitsBodySchema.safeParse({ labels }).success).toBe(false);
	});

	it("accepts 20 labels", () => {
		const labels = Array.from({ length: 20 }, (_, i) => `Flat ${i + 1}`);
		expect(createUnitsBodySchema.safeParse({ labels }).success).toBe(true);
	});

	it("rejects duplicate labels after trimming", () => {
		const result = createUnitsBodySchema.safeParse({
			labels: ["Flat 1", " Flat 1 "],
		});
		expect(result.success).toBe(false);
	});

	it("accepts distinct labels", () => {
		const result = createUnitsBodySchema.safeParse({
			labels: ["Flat 1", "Flat 2"],
		});
		expect(result.success).toBe(true);
	});
});

describe("updateUnitBodySchema", () => {
	it("accepts a valid label", () => {
		expect(
			updateUnitBodySchema.safeParse({ label: "Flat 1" }).success,
		).toBe(true);
	});

	it("rejects an empty label", () => {
		expect(updateUnitBodySchema.safeParse({ label: "" }).success).toBe(
			false,
		);
	});
});
