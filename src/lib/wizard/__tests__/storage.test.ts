import { beforeEach, describe, expect, it } from "vitest";

import {
	clearWizardProgress,
	loadWizardProgress,
	saveWizardProgress,
	WIZARD_PROGRESS_KEY,
	type WizardProgress,
} from "@/lib/wizard/storage";

const SAMPLE: WizardProgress = {
	version: 1,
	step: 1,
	communityId: "c-1",
	basics: {
		name: "Harmony Estate",
		contact_email: "admin@example.com",
		contact_phone: "+2348012345678",
	},
};

describe("wizard progress storage", () => {
	beforeEach(() => {
		localStorage.clear();
	});

	it("round-trips a saved progress object", () => {
		saveWizardProgress(SAMPLE);
		expect(loadWizardProgress()).toEqual(SAMPLE);
	});

	it("returns null when the key is absent", () => {
		expect(loadWizardProgress()).toBeNull();
	});

	it("returns null when the stored JSON is malformed", () => {
		localStorage.setItem(WIZARD_PROGRESS_KEY, "{{{");
		expect(loadWizardProgress()).toBeNull();
	});

	it("returns null when the version doesn't match", () => {
		localStorage.setItem(
			WIZARD_PROGRESS_KEY,
			JSON.stringify({ version: 99 }),
		);
		expect(loadWizardProgress()).toBeNull();
	});

	it("clearWizardProgress removes the key", () => {
		saveWizardProgress(SAMPLE);
		clearWizardProgress();
		expect(loadWizardProgress()).toBeNull();
	});
});
