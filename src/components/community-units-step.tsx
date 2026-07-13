"use client";

import { useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import { apiFetch, ApiError } from "@/lib/api";
import { applyError, forceLogout, mapError } from "@/lib/auth/errors";
import { expandLabels } from "@/lib/units/numbering";
import {
	addUnitsFormSchema,
	UNIT_LABEL_MAX,
	UNITS_PER_PROPERTY_MAX,
	unitLabelSchema,
	type AddUnitsFormValues,
	type Unit,
} from "@/lib/units/schemas";
import { clearWizardProgress } from "@/lib/wizard/storage";

type LoadPhase = "loading" | "error" | "community-missing" | "ready";

/** Inline-edit state for one summary row; null when no row is being edited. */
type RowEdit = { id: string; value: string; error: string | null };

export function CommunityUnitsStep({
	communityId,
	defaultPropertyId,
	onPropertyResolved,
	onContinue,
}: {
	communityId: string;
	/** Null for drafts saved before the create response carried it. */
	defaultPropertyId: string | null;
	onPropertyResolved: (propertyId: string) => void;
	onContinue: () => void;
}) {
	const [phase, setPhase] = useState<LoadPhase>("loading");
	const [units, setUnits] = useState<Unit[]>([]);
	const [mutating, setMutating] = useState(false);
	const [rowEdit, setRowEdit] = useState<RowEdit | null>(null);
	const [retryToken, setRetryToken] = useState(0);

	// The resolved property lives in a ref (not state): resolving it triggers
	// onPropertyResolved -> parent re-render with the prop now set, and the
	// bootstrap effect must not re-run for that.
	const propertyIdRef = useRef(defaultPropertyId);
	const onPropertyResolvedRef = useRef(onPropertyResolved);
	useEffect(() => {
		onPropertyResolvedRef.current = onPropertyResolved;
	}, [onPropertyResolved]);

	useEffect(() => {
		let cancelled = false;
		async function bootstrap() {
			setPhase("loading");
			try {
				let propertyId = propertyIdRef.current;
				if (!propertyId) {
					const community = await apiFetch<{
						default_property_id: string | null;
					}>(`/api/communities/${encodeURIComponent(communityId)}`);
					if (cancelled) return;
					propertyId = community.default_property_id;
					if (!propertyId) {
						setPhase("error");
						return;
					}
					propertyIdRef.current = propertyId;
					onPropertyResolvedRef.current(propertyId);
				}
				const page = await apiFetch<{ units: Unit[] }>(
					unitsPath(propertyId),
				);
				if (cancelled) return;
				setUnits(page.units);
				setPhase("ready");
			} catch (err) {
				if (cancelled) return;
				setPhase(
					err instanceof ApiError && err.code === "not_found"
						? "community-missing"
						: "error",
				);
			}
		}
		bootstrap();
		return () => {
			cancelled = true;
		};
	}, [communityId, retryToken]);

	const form = useForm<AddUnitsFormValues>({
		resolver: zodResolver(addUnitsFormSchema),
		defaultValues: { label: "", count: 1 },
		mode: "onChange",
	});

	const labelError = form.formState.errors.label?.message;
	const countError = form.formState.errors.count?.message;
	const isValid = form.formState.isValid;

	const remaining = UNITS_PER_PROPERTY_MAX - units.length;
	const atCapacity = remaining <= 0;

	const watchedLabel = useWatch({ control: form.control, name: "label" });
	const watchedCount = useWatch({ control: form.control, name: "count" });
	const preview = addPreview(watchedLabel, watchedCount, units);

	async function onAdd(values: AddUnitsFormValues) {
		const propertyId = propertyIdRef.current;
		if (!propertyId) return;

		if (values.count > remaining) {
			form.setError("count", {
				message: `Only ${remaining} more unit${remaining === 1 ? "" : "s"} can be added`,
			});
			return;
		}
		const labels = expandLabels(
			values.label,
			values.count,
			units.map((u) => u.label),
		);
		// The schema's length check assumes numbering starts at 1; continuing
		// past existing "Label N" units can add digits, so re-check for real.
		if (labels.some((label) => label.length > UNIT_LABEL_MAX)) {
			form.setError("label", {
				message:
					"That label is too long once numbered — try a shorter one",
			});
			return;
		}

		setMutating(true);
		try {
			const created = await apiFetch<{ units: Unit[] }>(
				unitsPath(propertyId),
				postJson({ labels }),
			);
			setUnits((prev) => [...prev, ...created.units]);
			form.reset({ label: "", count: 1 });
		} catch (err) {
			const retried = await retryAddOnConflict(err, propertyId, values);
			if (!retried) {
				applyError(err, {
					setError: form.setError,
					fieldMap: {
						unit_label_taken: "label",
						validation_failed: "label",
					},
				});
			}
		} finally {
			setMutating(false);
		}
	}

	/**
	 * A label conflict on a multi-unit add usually means our list is stale
	 * (another tab created units): refetch server truth, renumber past it,
	 * and retry once. A second conflict — or one on an un-numbered single
	 * label — surfaces to the form.
	 */
	async function retryAddOnConflict(
		err: unknown,
		propertyId: string,
		values: AddUnitsFormValues,
	): Promise<boolean> {
		if (!(err instanceof ApiError) || err.code !== "unit_label_taken") {
			return false;
		}
		if (values.count === 1) return false;
		try {
			const page = await apiFetch<{ units: Unit[] }>(
				unitsPath(propertyId),
			);
			setUnits(page.units);
			if (values.count > UNITS_PER_PROPERTY_MAX - page.units.length) {
				form.setError("count", {
					message: "Not enough room left for that many units",
				});
				return true;
			}
			const labels = expandLabels(
				values.label,
				values.count,
				page.units.map((u) => u.label),
			);
			const created = await apiFetch<{ units: Unit[] }>(
				unitsPath(propertyId),
				postJson({ labels }),
			);
			setUnits((prev) => [...prev, ...created.units]);
			form.reset({ label: "", count: 1 });
			return true;
		} catch (retryErr) {
			applyError(retryErr, {
				setError: form.setError,
				fieldMap: {
					unit_label_taken: "label",
					validation_failed: "label",
				},
			});
			return true;
		}
	}

	async function saveRowEdit(unit: Unit) {
		if (!rowEdit) return;
		const propertyId = propertyIdRef.current;
		if (!propertyId) return;

		const parsed = unitLabelSchema.safeParse(rowEdit.value);
		if (!parsed.success) {
			setRowEdit({
				...rowEdit,
				error: parsed.error.issues[0]?.message ?? "Invalid label",
			});
			return;
		}
		if (parsed.data === unit.label) {
			setRowEdit(null);
			return;
		}

		setMutating(true);
		try {
			const res = await apiFetch<{ unit: Unit }>(
				`${unitsPath(propertyId)}/${encodeURIComponent(unit.id)}`,
				{
					method: "PATCH",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ label: parsed.data }),
				},
			);
			setUnits((prev) =>
				prev.map((u) => (u.id === unit.id ? res.unit : u)),
			);
			setRowEdit(null);
		} catch (err) {
			const behavior = mapError(err, {
				unit_label_taken: "label",
				validation_failed: "label",
			});
			if (behavior.kind === "inline") {
				setRowEdit({ ...rowEdit, error: behavior.message });
			} else if (behavior.kind === "toast") {
				toast.error(behavior.message);
			} else {
				forceLogout(behavior.reason);
			}
		} finally {
			setMutating(false);
		}
	}

	async function removeUnit(unit: Unit) {
		const propertyId = propertyIdRef.current;
		if (!propertyId) return;
		setMutating(true);
		try {
			await apiFetch(
				`${unitsPath(propertyId)}/${encodeURIComponent(unit.id)}`,
				{ method: "DELETE" },
			);
			setUnits((prev) => prev.filter((u) => u.id !== unit.id));
		} catch (err) {
			const behavior = mapError(err);
			if (behavior.kind === "force-logout") {
				forceLogout(behavior.reason);
			} else {
				toast.error(behavior.message);
			}
		} finally {
			setMutating(false);
		}
	}

	function handleStartOver() {
		clearWizardProgress();
		window.location.reload();
	}

	return (
		<div className="mt-10">
			<h2 className="font-display font-extrabold tracking-[-0.04em] text-[24px]">
				Units
			</h2>
			<p className="mt-3 text-[14px] leading-[1.55] text-charcoal/65">
				Add the units people live in — flats, houses, shop spaces.
				Identical units can be added in one go and are numbered for you.
			</p>

			{phase === "loading" && (
				<p className="mt-8 text-[14px] text-charcoal/65">
					Loading units…
				</p>
			)}

			{phase === "community-missing" && (
				<div className="mt-8">
					<p className="text-[14px] leading-[1.55] text-charcoal/65">
						We couldn&apos;t find this community — it may have been
						removed.
					</p>
					<button
						type="button"
						onClick={handleStartOver}
						className="mt-5 w-full inline-flex items-center justify-center h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-charcoal text-white hover:bg-charcoal/90"
					>
						Start over
					</button>
				</div>
			)}

			{phase === "error" && (
				<div className="mt-8">
					<p className="text-[14px] leading-[1.55] text-charcoal/65">
						Couldn&apos;t load your units. Check your connection and
						try again.
					</p>
					<button
						type="button"
						onClick={() => setRetryToken((t) => t + 1)}
						className="mt-5 w-full inline-flex items-center justify-center h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-charcoal text-white hover:bg-charcoal/90"
					>
						Retry
					</button>
				</div>
			)}

			{phase === "ready" && (
				<>
					<form
						// onAdd reads propertyIdRef, so handleSubmit must be
						// invoked at event time, not during render.
						onSubmit={(event) => form.handleSubmit(onAdd)(event)}
						className="mt-8"
						noValidate
						aria-busy={mutating}
					>
						{atCapacity ? (
							<p className="text-[14px] leading-[1.55] text-charcoal/65">
								This community has reached its{" "}
								{UNITS_PER_PROPERTY_MAX}-unit limit. Remove a
								unit to add a different one.
							</p>
						) : (
							<>
								<div className="flex gap-3">
									<div className="flex-1">
										<label
											htmlFor="unit-label"
											className="block font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 mb-3"
										>
											Unit label
										</label>
										<input
											id="unit-label"
											type="text"
											placeholder="e.g. Flat"
											aria-invalid={
												labelError ? "true" : "false"
											}
											aria-describedby={
												labelError
													? "unit-label-error"
													: undefined
											}
											disabled={mutating}
											{...form.register("label")}
											className={`w-full h-[58px] rounded-[13px] bg-white border px-4 text-[18px] text-charcoal placeholder:text-charcoal/35 focus:outline-none transition-colors ${
												labelError
													? "border-red-500/60"
													: "border-charcoal/12 focus:border-charcoal/30"
											}`}
										/>
									</div>
									<div className="w-[110px]">
										<label
											htmlFor="unit-count"
											className="block font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 mb-3"
										>
											How many
										</label>
										<input
											id="unit-count"
											type="number"
											inputMode="numeric"
											min={1}
											max={remaining}
											aria-invalid={
												countError ? "true" : "false"
											}
											aria-describedby={
												countError
													? "unit-count-error"
													: undefined
											}
											disabled={mutating}
											{...form.register("count", {
												valueAsNumber: true,
											})}
											className={`w-full h-[58px] rounded-[13px] bg-white border px-4 text-[18px] text-charcoal placeholder:text-charcoal/35 focus:outline-none transition-colors ${
												countError
													? "border-red-500/60"
													: "border-charcoal/12 focus:border-charcoal/30"
											}`}
										/>
									</div>
								</div>

								{labelError && (
									<p
										id="unit-label-error"
										className="mt-2 text-sm text-red-600"
									>
										{labelError}
									</p>
								)}
								{countError && (
									<p
										id="unit-count-error"
										className="mt-2 text-sm text-red-600"
									>
										{countError}
									</p>
								)}
								{!labelError && !countError && preview && (
									<p className="mt-2 text-sm text-charcoal/55">
										{preview}
									</p>
								)}

								<button
									type="submit"
									disabled={!isValid || mutating}
									className="mt-5 w-full inline-flex items-center justify-center h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-charcoal text-white enabled:hover:bg-charcoal/90 disabled:bg-charcoal/8 disabled:text-charcoal/35 disabled:cursor-not-allowed"
								>
									{mutating ? "Adding…" : "Add"}
								</button>
							</>
						)}
					</form>

					<div className="mt-10">
						<h3 className="font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55">
							Units ({units.length})
						</h3>
						{units.length === 0 ? (
							<p className="mt-3 text-[14px] leading-[1.55] text-charcoal/65">
								No units yet — add your first one above.
							</p>
						) : (
							<ul className="mt-3 divide-y divide-charcoal/8 border-y border-charcoal/8">
								{units.map((unit) => (
									<li key={unit.id} className="py-3">
										{rowEdit?.id === unit.id ? (
											<div>
												<div className="flex items-center gap-3">
													<input
														type="text"
														value={rowEdit.value}
														onChange={(e) =>
															setRowEdit({
																id: unit.id,
																value: e.target
																	.value,
																error: null,
															})
														}
														aria-label={`New label for ${unit.label}`}
														aria-invalid={
															rowEdit.error
																? "true"
																: "false"
														}
														disabled={mutating}
														autoFocus
														className={`flex-1 h-[44px] rounded-[10px] bg-white border px-3 text-[16px] text-charcoal focus:outline-none transition-colors ${
															rowEdit.error
																? "border-red-500/60"
																: "border-charcoal/12 focus:border-charcoal/30"
														}`}
													/>
													<button
														type="button"
														onClick={() =>
															saveRowEdit(unit)
														}
														disabled={mutating}
														className="font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 hover:text-orange disabled:text-charcoal/25 transition-colors"
													>
														Save
													</button>
													<button
														type="button"
														onClick={() =>
															setRowEdit(null)
														}
														disabled={mutating}
														className="font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 hover:text-orange disabled:text-charcoal/25 transition-colors"
													>
														Cancel
													</button>
												</div>
												{rowEdit.error && (
													<p className="mt-2 text-sm text-red-600">
														{rowEdit.error}
													</p>
												)}
											</div>
										) : (
											<div className="flex items-center gap-3">
												<span className="flex-1 text-[16px] text-charcoal">
													{unit.label}
												</span>
												<button
													type="button"
													onClick={() =>
														setRowEdit({
															id: unit.id,
															value: unit.label,
															error: null,
														})
													}
													disabled={mutating}
													className="font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 hover:text-orange disabled:text-charcoal/25 transition-colors"
												>
													Edit
												</button>
												<button
													type="button"
													onClick={() =>
														removeUnit(unit)
													}
													disabled={mutating}
													className="font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 hover:text-orange disabled:text-charcoal/25 transition-colors"
												>
													Remove
												</button>
											</div>
										)}
									</li>
								))}
							</ul>
						)}
					</div>

					<button
						type="button"
						onClick={onContinue}
						disabled={units.length === 0 || mutating}
						className="mt-10 w-full inline-flex items-center justify-center gap-2 h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-charcoal/8 disabled:text-charcoal/35 disabled:cursor-not-allowed"
					>
						<span>Continue</span>
						<svg
							width="16"
							height="16"
							viewBox="0 0 16 16"
							fill="none"
							aria-hidden="true"
						>
							<path
								d="M3 8h10M9 4l4 4-4 4"
								stroke="currentColor"
								strokeWidth="1.8"
								strokeLinecap="round"
								strokeLinejoin="round"
							/>
						</svg>
					</button>
				</>
			)}
		</div>
	);
}

function unitsPath(propertyId: string): string {
	return `/api/properties/${encodeURIComponent(propertyId)}/units`;
}

function postJson(body: unknown): RequestInit {
	return {
		method: "POST",
		headers: { "Content-Type": "application/json" },
		body: JSON.stringify(body),
	};
}

/** "Will add Flat 4 – Flat 6" once a multi-unit entry looks plausible. */
function addPreview(
	label: string,
	count: number,
	units: Unit[],
): string | null {
	const base = label.trim();
	if (!base || !Number.isInteger(count) || count < 2) return null;
	if (count > UNITS_PER_PROPERTY_MAX) return null;
	const labels = expandLabels(
		base,
		count,
		units.map((u) => u.label),
	);
	return `Will add ${labels[0]} – ${labels[labels.length - 1]}`;
}
