import type { CreateCommunityBody } from "@/lib/communities/schemas";

/**
 * localStorage-backed wizard progress. Unlike src/lib/auth/storage.ts (which
 * hands short-lived values between adjacent auth screens via sessionStorage),
 * this persists across tabs/reloads so a half-finished wizard survives a
 * closed browser.
 */

export const WIZARD_STEPS = [
	"Basics",
	"Units",
	"Ownership",
	"Residents",
	"Guards",
] as const;

/** Written by every wizard step on progress; read on mount to resume. */
export const WIZARD_PROGRESS_KEY = "dwelli_wizard_progress";

export type WizardProgress = {
	version: 1; // bump to invalidate stale persisted shapes
	step: number; // 0-based index into WIZARD_STEPS
	communityId: string | null; // set once POST /api/communities succeeds
	basics: CreateCommunityBody | null;
};

function isWizardProgress(value: unknown): value is WizardProgress {
	if (typeof value !== "object" || value === null) return false;
	const v = value as Record<string, unknown>;
	return (
		v.version === 1 &&
		typeof v.step === "number" &&
		(v.communityId === null || typeof v.communityId === "string") &&
		(v.basics === null || typeof v.basics === "object")
	);
}

export function loadWizardProgress(): WizardProgress | null {
	if (typeof window === "undefined") return null;
	try {
		const raw = window.localStorage.getItem(WIZARD_PROGRESS_KEY);
		if (!raw) return null;
		const parsed: unknown = JSON.parse(raw);
		return isWizardProgress(parsed) ? parsed : null;
	} catch {
		return null;
	}
}

export function saveWizardProgress(progress: WizardProgress): void {
	if (typeof window === "undefined") return;
	window.localStorage.setItem(WIZARD_PROGRESS_KEY, JSON.stringify(progress));
}

export function clearWizardProgress(): void {
	if (typeof window === "undefined") return;
	window.localStorage.removeItem(WIZARD_PROGRESS_KEY);
}
