"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useRef, useState } from "react";
import { Controller, useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput, {
	getCountryCallingCode,
	type Country,
} from "react-phone-number-input";

import { apiFetch } from "@/lib/api";
import { applyError } from "@/lib/auth/errors";
import {
	phoneSchema,
	type PhoneInput as PhoneFormValues,
} from "@/lib/auth/schemas";
import { PENDING_PHONE_KEY, RESEND_AVAILABLE_AT_KEY } from "@/lib/auth/storage";

export function SignInForm() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [hasBlurred, setHasBlurred] = useState(false);

	const form = useForm<PhoneFormValues>({
		resolver: zodResolver(phoneSchema),
		defaultValues: { phone: "" },
		mode: "onChange",
	});

	const { errors, isValid, isSubmitting } = form.formState;
	// Suppress the inline error until the user has finished typing once — otherwise
	// it screams "invalid" on the very first digit.
	const phoneError = hasBlurred ? errors.phone?.message : undefined;

	// The calling code is non-editable (`countryCallingCodeEditable={false}`),
	// so parking the caret inside it is never useful. Only read inside event
	// handlers, hence a ref rather than state.
	const countryRef = useRef<Country>("NG");

	/** First caret position past the "+234 " prefix, clamped to the rendered value. */
	function minCaret(input: HTMLInputElement): number {
		const prefix = `+${getCountryCallingCode(countryRef.current)}`;
		const hasSpace = input.value[prefix.length] === " ";
		return Math.min(prefix.length + (hasSpace ? 1 : 0), input.value.length);
	}

	// Fires on every caret/selection change (click, arrows, Home, focus). Snap a
	// collapsed caret out of the prefix, but leave range selections alone so
	// select-all -> copy still grabs the full "+234 ..." string.
	function clampCaret(e: React.SyntheticEvent<HTMLInputElement>) {
		const input = e.currentTarget;
		const min = minCaret(input);
		const { selectionStart, selectionEnd } = input;
		if (selectionStart === null || selectionStart >= min) return;
		if (selectionStart === selectionEnd) {
			input.setSelectionRange(min, min);
		}
	}

	async function onSubmit(values: PhoneFormValues) {
		// A submit means the user is done typing, even if focus never left the
		// input (Enter key) — stop suppressing errors so a server-side rejection
		// is actually visible.
		setHasBlurred(true);
		try {
			const data = await apiFetch<{ resend_available_at?: string }>(
				"/api/auth/request-otp",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ phone: values.phone }),
					skipRefresh: true,
				},
			);
			sessionStorage.setItem(PENDING_PHONE_KEY, values.phone);
			if (data?.resend_available_at) {
				sessionStorage.setItem(
					RESEND_AVAILABLE_AT_KEY,
					data.resend_available_at,
				);
			} else {
				sessionStorage.removeItem(RESEND_AVAILABLE_AT_KEY);
			}
			// Forward the whole querystring so returnTo / future params all ride
			// along automatically — no need to remember to add each new one here.
			const qs = searchParams.toString();
			router.push(qs ? `/auth/verify?${qs}` : "/auth/verify");
		} catch (err) {
			applyError(err, {
				setError: form.setError,
				fieldMap: {
					invalid_phone: "phone",
					validation_failed: "phone",
				},
			});
		}
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mt-10"
			noValidate
			aria-busy={isSubmitting}
		>
			<label
				htmlFor="phone"
				className="block font-mono uppercase tracking-[0.16em] text-[10px] text-[#7A746B] mb-3"
			>
				Phone number
			</label>
			<div
				className={`dwelli-phone-input flex items-stretch bg-white border rounded-2xl overflow-hidden transition-colors ${
					phoneError
						? "border-red-500/60"
						: "border-charcoal/12 focus-within:border-charcoal/30"
				}`}
				onFocus={(e) => {
					// Refocusing the row means "let me fix it" — hide the error until
					// they leave again. Ignore focus moving within (input <-> country).
					if (
						!e.currentTarget.contains(
							e.relatedTarget as Node | null,
						)
					) {
						setHasBlurred(false);
					}
				}}
				onBlur={(e) => {
					// Focus moving WITHIN the wrapper (input <-> country select) isn't a
					// real blur; only mark touched when focus leaves the whole row.
					if (
						!e.currentTarget.contains(
							e.relatedTarget as Node | null,
						)
					) {
						setHasBlurred(true);
					}
				}}
			>
				<Controller
					control={form.control}
					name="phone"
					render={({ field }) => (
						<PhoneInput
							international
							defaultCountry="NG"
							countryCallingCodeEditable={false}
							onCountryChange={(country) => {
								countryRef.current = country ?? "NG";
							}}
							value={field.value || undefined}
							onChange={(value) => field.onChange(value ?? "")}
							numberInputProps={{
								id: "phone",
								name: field.name,
								autoComplete: "tel",
								placeholder: "801 234 5678",
								onSelect: clampCaret,
								// Some engines park the caret at 0 on keyboard focus before
								// any select event fires — same clamp, belt and braces.
								onFocus: clampCaret,
								"aria-invalid": phoneError ? "true" : "false",
								"aria-describedby": phoneError
									? "phone-error"
									: undefined,
							}}
						/>
					)}
				/>
				<div className="flex items-center pr-4">
					{isValid && (
						<span
							className="w-5 h-5 rounded-full bg-green flex items-center justify-center"
							aria-label="Valid number"
						>
							<svg
								width="11"
								height="11"
								viewBox="0 0 12 12"
								fill="none"
								aria-hidden="true"
							>
								<path
									d="M2.5 6.5l2.4 2.4L9.5 3.5"
									stroke="white"
									strokeWidth="1.8"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</span>
					)}
				</div>
			</div>

			{phoneError && (
				<p
					id="phone-error"
					role="alert"
					className="mt-2 text-sm text-red-600"
				>
					{phoneError}
				</p>
			)}

			<button
				type="submit"
				disabled={!isValid || isSubmitting}
				className="mt-5 w-full inline-flex items-center justify-center gap-2 h-14 rounded-full text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-charcoal/8 disabled:text-charcoal/35 disabled:cursor-not-allowed"
			>
				<span>{isSubmitting ? "Sending…" : "Send me a code"}</span>
				{!isSubmitting && (
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
				)}
			</button>
		</form>
	);
}
