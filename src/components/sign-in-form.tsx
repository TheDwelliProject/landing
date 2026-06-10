"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import PhoneInput from "react-phone-number-input";

import { apiFetch } from "@/lib/api";
import { applyError } from "@/lib/auth/errors";
import { phoneSchema, type PhoneInput as PhoneFormValues } from "@/lib/auth/schemas";

const PENDING_PHONE_KEY = "dwelli_pending_phone";
const RESEND_AVAILABLE_AT_KEY = "dwelli_resend_available_at";

export function SignInForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [submitting, setSubmitting] = useState(false);

  const form = useForm<PhoneFormValues>({
    resolver: zodResolver(phoneSchema),
    defaultValues: { phone: "" },
    mode: "onChange",
  });

  const phone = useWatch({ control: form.control, name: "phone" });
  const phoneError = form.formState.errors.phone?.message;
  const isValid = form.formState.isValid && !!phone;

  async function onSubmit(values: PhoneFormValues) {
    setSubmitting(true);
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
        sessionStorage.setItem(RESEND_AVAILABLE_AT_KEY, data.resend_available_at);
      } else {
        sessionStorage.removeItem(RESEND_AVAILABLE_AT_KEY);
      }
      const params = new URLSearchParams();
      const intent = searchParams.get("intent");
      if (intent) params.set("intent", intent);
      const returnTo = searchParams.get("returnTo");
      if (returnTo) params.set("returnTo", returnTo);
      const qs = params.toString();
      router.push(qs ? `/auth/verify?${qs}` : "/auth/verify");
    } catch (err) {
      applyError(err, {
        setError: form.setError,
        fieldMap: { invalid_phone: "phone", validation_failed: "phone" },
      });
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={form.handleSubmit(onSubmit)} className="mt-10" noValidate>
      <label
        htmlFor="phone"
        className="block font-mono uppercase tracking-[0.16em] text-[10px] text-white/45 mb-3"
      >
        Phone number
      </label>
      <div
        className={`dwelli-phone-input flex items-stretch bg-white/6 border rounded-2xl overflow-hidden transition-colors ${
          phoneError ? "border-red-500/60" : "border-white/12 focus-within:border-white/30"
        }`}
      >
        <PhoneInput
          international
          defaultCountry="NG"
          countryCallingCodeEditable={false}
          value={phone || undefined}
          onChange={(value) =>
            form.setValue("phone", value ?? "", {
              shouldValidate: true,
              shouldDirty: true,
            })
          }
          numberInputProps={{
            id: "phone",
            name: "phone",
            autoComplete: "tel",
            placeholder: "801 234 5678",
            "aria-invalid": phoneError ? "true" : "false",
            "aria-describedby": phoneError ? "phone-error" : undefined,
          }}
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
        <p id="phone-error" className="mt-2 text-sm text-red-400">
          {phoneError}
        </p>
      )}

      <button
        type="submit"
        disabled={!isValid || submitting}
        className="mt-5 w-full inline-flex items-center justify-center gap-2 h-14 rounded-full text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-white/8 disabled:text-white/35 disabled:cursor-not-allowed"
      >
        <span>{submitting ? "Sending…" : "Send me a code"}</span>
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
