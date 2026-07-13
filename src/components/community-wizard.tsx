"use client";

import { useEffect, useState } from "react";

import { CommunityBasicsForm } from "@/components/community-basics-form";
import { CommunityUnitsStep } from "@/components/community-units-step";
import { WizardStepper } from "@/components/wizard-stepper";
import type { CreateCommunityBody } from "@/lib/communities/schemas";
import {
	loadWizardProgress,
	saveWizardProgress,
	WIZARD_STEPS,
	type WizardProgress,
} from "@/lib/wizard/storage";

const INITIAL_PROGRESS: WizardProgress = {
	version: 1,
	step: 0,
	communityId: null,
	defaultPropertyId: null,
	basics: null,
};

export function CommunityWizard() {
	const [state, setState] = useState<{
		hydrated: boolean;
		progress: WizardProgress;
	}>({ hydrated: false, progress: INITIAL_PROGRESS });

	useEffect(() => {
		// Reading localStorage during render would mismatch the server-rendered
		// markup — only hydrate after mount, and in a single setState call so
		// there's no intermediate "hydrated but stale progress" render.
		const saved = loadWizardProgress();
		// A draft past step 0 without a community id can't render any later
		// screen — clamp back to Basics rather than crash.
		const progress =
			saved && saved.step > 0 && !saved.communityId
				? { ...saved, step: 0 }
				: saved;
		// localStorage is client-only, so this state is intentionally populated
		// after hydration rather than during render.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setState({ hydrated: true, progress: progress ?? INITIAL_PROGRESS });
	}, []);

	const { hydrated, progress } = state;
	function setProgress(next: WizardProgress) {
		setState({ hydrated: true, progress: next });
	}

	if (!hydrated) return null;

	function handleCreated(
		communityId: string,
		defaultPropertyId: string | null,
		values: CreateCommunityBody,
	) {
		const next: WizardProgress = {
			version: 1,
			step: 1,
			communityId,
			defaultPropertyId,
			basics: values,
		};
		saveWizardProgress(next);
		setProgress(next);
	}

	function handleResumeContinue() {
		const next: WizardProgress = { ...progress, step: 1 };
		saveWizardProgress(next);
		setProgress(next);
	}

	function handlePropertyResolved(propertyId: string) {
		const next: WizardProgress = {
			...progress,
			defaultPropertyId: propertyId,
		};
		saveWizardProgress(next);
		setProgress(next);
	}

	function handleUnitsContinue() {
		const next: WizardProgress = { ...progress, step: 2 };
		saveWizardProgress(next);
		setProgress(next);
	}

	return (
		<div className="mt-8">
			<WizardStepper steps={WIZARD_STEPS} current={progress.step} />

			{progress.step === 0 && progress.communityId ? (
				<div className="mt-10">
					<p className="text-[14px] leading-[1.55] text-charcoal/65">
						Continuing your draft — {progress.basics?.name}
					</p>
					<button
						type="button"
						onClick={handleResumeContinue}
						className="mt-5 w-full inline-flex items-center justify-center gap-2 h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-orange text-white hover:bg-orange/90"
					>
						Continue
					</button>
				</div>
			) : null}

			{progress.step === 0 && !progress.communityId ? (
				<CommunityBasicsForm
					defaultValues={progress.basics ?? undefined}
					onCreated={handleCreated}
				/>
			) : null}

			{progress.step === 1 && progress.communityId ? (
				<CommunityUnitsStep
					communityId={progress.communityId}
					defaultPropertyId={progress.defaultPropertyId}
					onPropertyResolved={handlePropertyResolved}
					onContinue={handleUnitsContinue}
				/>
			) : null}

			{progress.step >= 2 ? (
				<div className="mt-10">
					<h2 className="font-display font-extrabold tracking-[-0.04em] text-[24px]">
						Ownership
					</h2>
					<p className="mt-3 text-[14px] leading-[1.55] text-charcoal/65">
						Ownership setup lands here in the next stage.
					</p>
				</div>
			) : null}
		</div>
	);
}
