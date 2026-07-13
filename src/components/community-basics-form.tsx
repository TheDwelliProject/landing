"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/lib/api";
import { applyError } from "@/lib/auth/errors";
import {
	createCommunityBodySchema,
	type CreateCommunityBody,
} from "@/lib/communities/schemas";

export function CommunityBasicsForm({
	defaultValues,
	onCreated,
}: {
	defaultValues?: Partial<CreateCommunityBody>;
	onCreated: (communityId: string, values: CreateCommunityBody) => void;
}) {
	const [submitting, setSubmitting] = useState(false);

	const form = useForm<CreateCommunityBody>({
		resolver: zodResolver(createCommunityBodySchema),
		defaultValues: {
			name: "",
			contact_email: "",
			contact_phone: "",
			...defaultValues,
		},
		mode: "onChange",
	});

	const nameError = form.formState.errors.name?.message;
	const emailError = form.formState.errors.contact_email?.message;
	const phoneError = form.formState.errors.contact_phone?.message;
	const isValid = form.formState.isValid;

	async function onSubmit(values: CreateCommunityBody) {
		setSubmitting(true);
		try {
			const res = await apiFetch<{
				community_id: string;
				status: string;
			}>("/api/communities", {
				method: "POST",
				headers: { "Content-Type": "application/json" },
				body: JSON.stringify({
					name: values.name.trim(),
					contact_email: values.contact_email.trim(),
					contact_phone: values.contact_phone.trim(),
				}),
			});
			onCreated(res.community_id, values);
		} catch (err) {
			applyError(err, {
				setError: form.setError,
				fieldMap: {
					validation_failed: "name",
					invalid_contact_email: "contact_email",
					invalid_contact_phone: "contact_phone",
				},
			});
			setSubmitting(false);
		}
	}

	return (
		<form
			onSubmit={form.handleSubmit(onSubmit)}
			className="mt-10"
			noValidate
			aria-busy={submitting}
		>
			<label
				htmlFor="name"
				className="block font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 mb-3"
			>
				Community name
			</label>
			<input
				id="name"
				type="text"
				autoComplete="organization"
				autoFocus
				placeholder="e.g. Harmony Estate"
				aria-invalid={nameError ? "true" : "false"}
				aria-describedby={nameError ? "name-error" : undefined}
				disabled={submitting}
				{...form.register("name")}
				className={`w-full h-[58px] rounded-[13px] bg-white border px-4 text-[18px] text-charcoal placeholder:text-charcoal/35 focus:outline-none transition-colors ${
					nameError
						? "border-red-500/60"
						: "border-charcoal/12 focus:border-charcoal/30"
				}`}
			/>

			{nameError && (
				<p id="name-error" className="mt-2 text-sm text-red-600">
					{nameError}
				</p>
			)}

			<label
				htmlFor="contact_email"
				className="mt-5 block font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 mb-3"
			>
				Contact email
			</label>
			<input
				id="contact_email"
				type="email"
				autoComplete="email"
				placeholder="you@example.com"
				aria-invalid={emailError ? "true" : "false"}
				aria-describedby={
					emailError ? "contact_email-error" : undefined
				}
				disabled={submitting}
				{...form.register("contact_email")}
				className={`w-full h-[58px] rounded-[13px] bg-white border px-4 text-[18px] text-charcoal placeholder:text-charcoal/35 focus:outline-none transition-colors ${
					emailError
						? "border-red-500/60"
						: "border-charcoal/12 focus:border-charcoal/30"
				}`}
			/>

			{emailError && (
				<p
					id="contact_email-error"
					className="mt-2 text-sm text-red-600"
				>
					{emailError}
				</p>
			)}

			<label
				htmlFor="contact_phone"
				className="mt-5 block font-mono uppercase tracking-[0.16em] text-[10px] text-charcoal/55 mb-3"
			>
				Contact phone
			</label>
			<input
				id="contact_phone"
				type="tel"
				inputMode="tel"
				autoComplete="tel"
				placeholder="+234 801 234 5678"
				aria-invalid={phoneError ? "true" : "false"}
				aria-describedby={
					phoneError ? "contact_phone-error" : undefined
				}
				disabled={submitting}
				{...form.register("contact_phone")}
				className={`w-full h-[58px] rounded-[13px] bg-white border px-4 text-[18px] text-charcoal placeholder:text-charcoal/35 focus:outline-none transition-colors ${
					phoneError
						? "border-red-500/60"
						: "border-charcoal/12 focus:border-charcoal/30"
				}`}
			/>

			{phoneError && (
				<p
					id="contact_phone-error"
					className="mt-2 text-sm text-red-600"
				>
					{phoneError}
				</p>
			)}

			<button
				type="submit"
				disabled={!isValid || submitting}
				className="mt-5 w-full inline-flex items-center justify-center gap-2 h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-charcoal/8 disabled:text-charcoal/35 disabled:cursor-not-allowed"
			>
				<span>{submitting ? "Creating…" : "Continue"}</span>
				{!submitting && (
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
