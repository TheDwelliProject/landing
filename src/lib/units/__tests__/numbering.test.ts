import { describe, expect, it } from "vitest";

import { expandLabels, nextStartNumber } from "@/lib/units/numbering";

describe("expandLabels", () => {
	it("keeps the bare label when count is 1, regardless of existing labels", () => {
		expect(expandLabels("Flat", 1, ["Flat 1", "Flat 2"])).toEqual(["Flat"]);
	});

	it("numbers from 1 when there are no existing labels", () => {
		expect(expandLabels("Flat", 3, [])).toEqual([
			"Flat 1",
			"Flat 2",
			"Flat 3",
		]);
	});

	it("continues the sequence past existing numbered labels", () => {
		expect(expandLabels("Flat", 2, ["Flat 1", "Flat 2"])).toEqual([
			"Flat 3",
			"Flat 4",
		]);
	});

	it("ignores zero-padded and bare non-participant labels", () => {
		expect(expandLabels("Flat", 2, ["Flat A", "Flat 03", "Flat"])).toEqual([
			"Flat 1",
			"Flat 2",
		]);
	});

	it("handles a base containing regex-special characters", () => {
		expect(expandLabels("Block (A)", 2, ["Block (A) 1"])).toEqual([
			"Block (A) 2",
			"Block (A) 3",
		]);
	});
});

describe("nextStartNumber", () => {
	it("starts at 1 with no existing labels", () => {
		expect(nextStartNumber("Flat", [])).toBe(1);
	});

	it("finds the max plain-digit suffix and returns the next number", () => {
		expect(nextStartNumber("Flat", ["Flat 1", "Flat 2"])).toBe(3);
	});

	it("ignores zero-padded and bare labels", () => {
		expect(nextStartNumber("Flat", ["Flat A", "Flat 03", "Flat"])).toBe(1);
	});

	it("handles a base containing regex-special characters", () => {
		expect(nextStartNumber("Block (A)", ["Block (A) 1"])).toBe(2);
	});
});
