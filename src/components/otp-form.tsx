"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { AlertTriangle, BadgeCheck, CircleX } from "lucide-react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
	InputOTP,
	InputOTPGroup,
	InputOTPSlot,
} from "@/components/ui/input-otp";
import { ApiError } from "@/lib/api";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { deriveDeviceLabel } from "@/lib/auth/device-label";
import { applyError } from "@/lib/auth/errors";
import { safeReturnTo } from "@/lib/auth/return-to";
import { otpSchema, type OtpInput } from "@/lib/auth/schemas";

const PENDING_PHONE_KEY = "dwelli_pending_phone";
const RESEND_AVAILABLE_AT_KEY = "dwelli_resend_available_at";
// Hands the verified phone to /onboarding/profile so its header can show
// which account the new user just created. Read (and cleared) over there.
const PROFILE_PHONE_KEY = "dwelli_profile_phone";
// Fallbacks only — the backend sends `resend_available_at` on every
// successful /v1/auth/otp call and `retry_after_seconds` on every 429.
const RESEND_FALLBACK_SECONDS = 60;
const RATE_LIMIT_FALLBACK_SECONDS = 60;
// The backend collapses wrong/expired/exhausted into one `invalid_otp` by
// design and kills the code after 5 wrong attempts, so "too many tries" can
// only be tracked client-side. We prompt for a new code at 3 (the backend's
// recommendation) since attempts from other devices/sessions also count.
const TOO_MANY_TRIES_AFTER = 3;
const VERIFIED_REDIRECT_DELAY_MS = 950;

type OtpState = "entry" | "rate-limited" | "too-many-tries" | "verified";

function maskPhone(phone: string): string {
	if (phone.length <= 4) return phone;
	return `${phone.slice(0, phone.length - 4).replace(/\d/g, "•")}${phone.slice(-4)}`;
}

/** Seconds from now until an RFC 3339 timestamp, or null if absent/unparsable. */
function secondsUntil(iso: string | null | undefined): number | null {
	if (!iso) return null;
	const at = Date.parse(iso);
	if (Number.isNaN(at)) return null;
	return Math.max(0, Math.ceil((at - Date.now()) / 1000));
}

type OtpFormProps = {
	intentLabel?: string;
};

export function OtpForm({ intentLabel }: OtpFormProps) {
	const router = useRouter();
	const searchParams = useSearchParams();
	const { refresh } = useAuth();
	const [phone, setPhone] = useState<string | null>(null);
	const [submitting, setSubmitting] = useState(false);
	const [secondsLeft, setSecondsLeft] = useState(RESEND_FALLBACK_SECONDS);
	const [resending, setResending] = useState(false);
	const [state, setState] = useState<OtpState>("entry");
	const [invalidAttempts, setInvalidAttempts] = useState(0);
	const [pauseSecondsLeft, setPauseSecondsLeft] = useState(0);
	// Both /v1/auth/otp and /v1/auth/verify can 429; the copy differs.
	const [rateLimitedBy, setRateLimitedBy] = useState<"request" | "verify">(
		"request",
	);
	const tickRef = useRef<number | null>(null);
	const redirectRef = useRef<number | null>(null);
	// Guards against the rare double-submit caused by input-otp's internal
	// synthetic input re-dispatches racing the network call — the React
	// `submitting` state lags one render behind and isn't a reliable gate.
	const inFlightRef = useRef(false);

	const form = useForm<OtpInput>({
		resolver: zodResolver(otpSchema),
		defaultValues: { otp: "" },
		mode: "onChange",
	});

	const otpValue = useWatch({ control: form.control, name: "otp" });

	const shouldRenderFormError = useMemo(() => {
		if (form.formState.errors.otp) {
			const { type } = form.formState.errors.otp;
			return (
				!isPaused &&
				type === "invalid_format" &&
				form.getValues("otp").length < 6
			);
		}
		return false;
	}, [form]);

	useEffect(() => {
		const stored = sessionStorage.getItem(PENDING_PHONE_KEY);
		if (!stored) {
			router.replace("/auth");
			return;
		}
		// Session storage is client-only, so this state is intentionally populated
		// after hydration rather than during render.
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setPhone(stored);
		// Seed the resend cooldown from the timestamp the backend returned when
		// the code was requested, instead of guessing a flat window.
		const wait = secondsUntil(
			sessionStorage.getItem(RESEND_AVAILABLE_AT_KEY),
		);
		if (wait !== null) setSecondsLeft(wait);
	}, [router]);

	useEffect(() => {
		if (secondsLeft <= 0) return;
		tickRef.current = window.setTimeout(
			() => setSecondsLeft((s) => s - 1),
			1000,
		);
		return () => {
			if (tickRef.current) window.clearTimeout(tickRef.current);
		};
	}, [secondsLeft]);

	// Rate-limit pauses lift on the backend's clock; "too many tries" has no
	// timer — that state only clears when a new code is requested.
	useEffect(() => {
		if (pauseSecondsLeft <= 0) return;
		const timeout = window.setTimeout(() => {
			setPauseSecondsLeft((seconds) => Math.max(0, seconds - 1));
			if (pauseSecondsLeft <= 1) {
				setState((current) =>
					current === "rate-limited" ? "entry" : current,
				);
			}
		}, 1000);
		return () => window.clearTimeout(timeout);
	}, [pauseSecondsLeft]);

	useEffect(() => {
		return () => {
			if (redirectRef.current) window.clearTimeout(redirectRef.current);
		};
	}, []);

	const onSubmit = useCallback(
		async (values: OtpInput) => {
			if (!phone || state === "verified" || state === "too-many-tries")
				return;
			setSubmitting(true);
			try {
				const data = await apiFetch<{
					user_id: string;
					is_new_user?: boolean;
				}>("/api/auth/verify", {
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({
						phone,
						otp: values.otp,
						device_label: deriveDeviceLabel(
							typeof navigator === "undefined"
								? null
								: navigator.userAgent,
						),
					}),
					skipRefresh: true,
				});
				sessionStorage.removeItem(PENDING_PHONE_KEY);
				sessionStorage.removeItem(RESEND_AVAILABLE_AT_KEY);
				if (data?.is_new_user) {
					sessionStorage.setItem(PROFILE_PHONE_KEY, phone);
				}
				await refresh();
				setState("verified");
				redirectRef.current = window.setTimeout(() => {
					const returnTo = searchParams.get("returnTo");
					// Brand-new account -> collect their name first. The returnTo hint
					// rides along so the profile screen can resume the original journey.
					if (data?.is_new_user) {
						router.replace(
							returnTo
								? `/onboarding/profile?returnTo=${encodeURIComponent(returnTo)}`
								: "/onboarding/profile",
						);
						return;
					}
					router.replace(safeReturnTo(returnTo));
				}, VERIFIED_REDIRECT_DELAY_MS);
			} catch (err) {
				if (err instanceof ApiError && err.code === "invalid_otp") {
					const nextAttempts = invalidAttempts + 1;
					setInvalidAttempts(nextAttempts);
					form.setValue("otp", "", { shouldDirty: true });
					// Re-validate the cleared field before setting the custom error —
					// setValue's shouldValidate runs the resolver async, which would
					// resolve after setError and clobber this message with the schema's.
					await form.trigger("otp");
					if (nextAttempts >= TOO_MANY_TRIES_AFTER) {
						setState("too-many-tries");
						return;
					}
					form.setError("otp", {
						message:
							"Code incorrect or expired. Try again or request a new code.",
					});
					return;
				}
				if (err instanceof ApiError && err.code === "rate_limited") {
					setRateLimitedBy("verify");
					setState("rate-limited");
					setPauseSecondsLeft(
						err.retryAfterSeconds ?? RATE_LIMIT_FALLBACK_SECONDS,
					);
					return;
				}
				applyError(err, {
					setError: form.setError,
					fieldMap: { invalid_otp: "otp", validation_failed: "otp" },
					clear: { setValue: form.setValue, fields: ["otp"] },
				});
			} finally {
				setSubmitting(false);
			}
		},
		[phone, state, refresh, router, form, searchParams, invalidAttempts],
	);

	const submitOnce = useCallback(() => {
		if (inFlightRef.current) return;
		inFlightRef.current = true;
		void form
			.handleSubmit(onSubmit)()
			.finally(() => {
				inFlightRef.current = false;
			});
	}, [form, onSubmit]);

	async function handleResend() {
		if (!phone || secondsLeft > 0 || pauseSecondsLeft > 0 || resending)
			return;
		setResending(true);
		try {
			const data = await apiFetch<{ resend_available_at?: string }>(
				"/api/auth/request-otp",
				{
					method: "POST",
					headers: { "Content-Type": "application/json" },
					body: JSON.stringify({ phone }),
					skipRefresh: true,
				},
			);
			if (data?.resend_available_at) {
				sessionStorage.setItem(
					RESEND_AVAILABLE_AT_KEY,
					data.resend_available_at,
				);
			}
			setSecondsLeft(
				secondsUntil(data?.resend_available_at) ??
					RESEND_FALLBACK_SECONDS,
			);
			setInvalidAttempts(0);
			setState("entry");
			form.clearErrors("otp");
			toast.success("New code sent.");
		} catch (err) {
			if (err instanceof ApiError && err.code === "rate_limited") {
				setRateLimitedBy("request");
				setState("rate-limited");
				setPauseSecondsLeft(
					err.retryAfterSeconds ?? RATE_LIMIT_FALLBACK_SECONDS,
				);
				return;
			}
			applyError(err, { setError: form.setError });
		} finally {
			setResending(false);
		}
	}

	if (!phone) {
		return null;
	}

	const otpError = form.formState.errors.otp?.message;
	const isPaused = state === "rate-limited" || state === "too-many-tries";
	const isVerified = state === "verified";
	const canRequestNewCode = secondsLeft <= 0 && pauseSecondsLeft <= 0;

	return (
		<form
			onSubmit={(e) => {
				e.preventDefault();
				submitOnce();
			}}
			className="mt-10"
			noValidate
			aria-busy={submitting}
		>
			{isVerified ? (
				<VerifiedState otp={otpValue} />
			) : (
				<>
					<div className="mb-8">
						<div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-orange/15 text-orange">
							<span className="h-1.5 w-1.5 rounded-full bg-current" />
							<span className="font-mono uppercase tracking-[0.18em] text-[10px]">
								Step 2 · Verify
							</span>
						</div>
					</div>

					<h2 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
						Check your
						<br />
						messages.
					</h2>

					{intentLabel && (
						<div className="mt-8 inline-flex items-start gap-3 rounded-xl bg-white/5 border border-white/12 px-4 py-3 text-[14px] text-white/75 max-w-full">
							<span
								aria-hidden="true"
								className="text-white/55 text-[15px] leading-[1.4] shrink-0"
							>
								↩
							</span>
							<span className="min-w-0 leading-[1.4]">
								Continuing to{" "}
								<span className="text-white font-semibold">
									{intentLabel}
								</span>
							</span>
						</div>
					)}

					<p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[420px]">
						We sent a 6-digit code to{" "}
						<span className="text-white font-semibold">
							{maskPhone(phone)}
						</span>{" "}
						<button
							type="button"
							onClick={() => router.push("/auth")}
							className="text-orange underline-offset-2 hover:underline"
						>
							edit
						</button>
					</p>

					<label htmlFor="otp" className="sr-only">
						6-digit code
					</label>

					<InputOTP
						id="otp"
						maxLength={6}
						autoFocus
						value={otpValue}
						onChange={(value) =>
							form.setValue("otp", value, {
								shouldValidate: true,
								shouldDirty: true,
							})
						}
						onComplete={submitOnce}
						disabled={submitting || isPaused}
						inputMode="numeric"
						containerClassName="mt-7 gap-2 max-w-full overflow-hidden"
					>
						<InputOTPGroup className="gap-2">
							{[0, 1, 2, 3, 4, 5].map((i) => (
								<InputOTPSlot
									key={i}
									index={i}
									className={`h-16 w-[3.35rem] rounded-xl border bg-white/[0.04] text-white text-2xl font-semibold first:rounded-xl last:rounded-xl ${
										state === "too-many-tries"
											? "border-red-400/40 bg-red-500/[0.07] text-white/40"
											: "border-white/18"
									}`}
								/>
							))}
						</InputOTPGroup>
					</InputOTP>

					{state === "rate-limited" && (
						<OtpStatusPanel
							tone="amber"
							icon={
								<AlertTriangle
									className="h-4 w-4"
									aria-hidden="true"
								/>
							}
							title={
								rateLimitedBy === "verify"
									? "Too many attempts"
									: "Too many codes requested"
							}
							body={
								rateLimitedBy === "verify"
									? `Verification is temporarily paused. Try again in ${formatWait(pauseSecondsLeft)}.`
									: `We've sent several codes to this number recently. Try again in ${formatWait(pauseSecondsLeft)}.`
							}
						/>
					)}

					{state === "too-many-tries" && (
						<OtpStatusPanel
							tone="red"
							icon={
								<CircleX
									className="h-4 w-4"
									aria-hidden="true"
								/>
							}
							title="Too many incorrect tries"
							body={
								canRequestNewCode
									? "For your security this code no longer works. Request a new one below."
									: `For your security this code no longer works. You can request a new one in ${formatWait(secondsLeft)}.`
							}
						/>
					)}

					{shouldRenderFormError && (
						<p className="mt-3 text-sm text-red-400" role="alert">
							{otpError}
						</p>
					)}

					<div className="mt-6 flex items-center justify-between gap-4 text-[14px] text-white/55">
						{canRequestNewCode ? (
							<button
								type="button"
								onClick={handleResend}
								disabled={resending}
								className="text-orange hover:text-orange/80 disabled:opacity-60"
							>
								{resending ? "Sending…" : "Send a new code"}
							</button>
						) : (
							<span>
								{state === "rate-limited"
									? "Resend paused"
									: `Resend available in ${secondsLeft}s`}
							</span>
						)}

						<span className="font-mono uppercase tracking-[0.22em] text-[10px] text-white/35">
							Paste-friendly
						</span>
					</div>

					<button
						type="submit"
						disabled={
							!form.formState.isValid || submitting || isPaused
						}
						className="mt-7 w-full inline-flex items-center justify-center gap-2 h-14 rounded-full text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-white/8 disabled:text-white/35 disabled:cursor-not-allowed"
					>
						<span>{submitting ? "Verifying…" : "Verify code"}</span>
					</button>
				</>
			)}
		</form>
	);
}

function OtpStatusPanel({
	tone,
	icon,
	title,
	body,
}: {
	tone: "amber" | "red";
	icon: React.ReactNode;
	title: string;
	body: string;
}) {
	const classes =
		tone === "amber"
			? "border-amber/45 bg-amber/15 text-amber"
			: "border-red-500/45 bg-red-500/15 text-red-300";

	return (
		<div
			role="alert"
			className={`mt-5 flex gap-3 rounded-xl border px-4 py-4 ${classes}`}
		>
			<div className="mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white/10">
				{icon}
			</div>
			<div className="min-w-0 text-[14px] leading-[1.45]">
				<p className="font-semibold text-white">{title}</p>
				<p className="mt-1 text-white/75">{body}</p>
			</div>
		</div>
	);
}

function VerifiedState({ otp }: { otp: string }) {
	const digits = otp.padEnd(6, " ").slice(0, 6).split("");

	return (
		<div aria-live="polite" className="pt-16">
			<div className="mb-8">
				<div className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 bg-green/15 text-green">
					<span className="h-1.5 w-1.5 rounded-full bg-current" />
					<span className="font-mono uppercase tracking-[0.18em] text-[10px]">
						Verified
					</span>
					<BadgeCheck className="h-3.5 w-3.5" aria-hidden="true" />
				</div>
			</div>

			<h2 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
				You&apos;re{" "}
				<span className="font-serif font-normal italic tracking-tight">
					in.
				</span>
			</h2>

			<p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[360px]">
				Code confirmed. Taking you to your space...
			</p>

			<div className="mt-7 flex gap-2 overflow-hidden">
				{digits.map((digit, index) => (
					<div
						key={`${digit}-${index}`}
						className="flex h-16 w-[3.35rem] shrink-0 items-center justify-center rounded-xl border border-green bg-green/10 text-2xl font-semibold text-white"
					>
						{digit}
					</div>
				))}
			</div>
		</div>
	);
}

function formatWait(seconds: number): string {
	if (seconds < 60) {
		const s = Math.max(1, seconds);
		return `${s} second${s === 1 ? "" : "s"}`;
	}
	const minutes = Math.ceil(seconds / 60);
	return `${minutes} minute${minutes === 1 ? "" : "s"}`;
}
