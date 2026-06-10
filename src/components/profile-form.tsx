"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import { apiFetch } from "@/lib/api";
import { applyError } from "@/lib/auth/errors";
import { safeReturnTo } from "@/lib/auth/return-to";
import { profileSchema, type ProfileInput } from "@/lib/auth/schemas";

const PROFILE_PHONE_KEY = "dwelli_profile_phone";

export function ProfileForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<ProfileInput>({
    resolver: zodResolver(profileSchema),
    defaultValues: { name: "" },
    mode: "onChange",
  });

  const name = useWatch({ control: form.control, name: "name" });
  const nameError = form.formState.errors.name?.message;
  const isValid = form.formState.isValid && !!name?.trim();

  async function onSubmit(values: ProfileInput) {
    setSubmitting(true);
    try {
      await apiFetch("/api/me", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: values.name.trim() }),
      });
      sessionStorage.removeItem(PROFILE_PHONE_KEY);
      // Profile complete — resume the journey the user was on before auth
      // (e.g. the wizard), or fall back to the admin home.
      router.replace(safeReturnTo(searchParams.get("returnTo")));
    } catch (err) {
      applyError(err, {
        setError: form.setError,
        fieldMap: { validation_failed: "name" },
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
        className="block font-mono uppercase tracking-[0.16em] text-[10px] text-white/50 mb-3"
      >
        Full name
      </label>
      <input
        id="name"
        type="text"
        autoComplete="name"
        autoFocus
        placeholder="e.g. Adaeze Okeke"
        aria-invalid={nameError ? "true" : "false"}
        aria-describedby={nameError ? "name-error" : undefined}
        disabled={submitting}
        {...form.register("name")}
        className={`w-full h-[58px] rounded-[13px] bg-white/[0.04] border px-4 text-[18px] text-white placeholder:text-white/30 focus:outline-none transition-colors ${
          nameError
            ? "border-red-500/60"
            : "border-white/14 focus:border-white/30"
        }`}
      />

      {nameError && (
        <p id="name-error" className="mt-2 text-sm text-red-400">
          {nameError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-[58px] rounded-[13px] text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-white/8 disabled:text-white/40 disabled:cursor-not-allowed"
      >
        <span>{submitting ? "Saving…" : "Continue"}</span>
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
