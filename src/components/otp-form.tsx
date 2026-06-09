"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useCallback, useEffect, useRef, useState } from "react";
import { useForm, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";

import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/lib/auth/context";
import { deriveDeviceLabel } from "@/lib/auth/device-label";
import { applyError } from "@/lib/auth/errors";
import { safeReturnTo } from "@/lib/auth/return-to";
import { otpSchema, type OtpInput } from "@/lib/auth/schemas";

const PENDING_PHONE_KEY = "dwelli_pending_phone";
const RESEND_SECONDS = 60;

function maskPhone(phone: string): string {
  if (phone.length <= 4) return phone;
  return `${phone.slice(0, phone.length - 4).replace(/\d/g, "•")}${phone.slice(-4)}`;
}

export function OtpForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refresh } = useAuth();
  const [phone, setPhone] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [secondsLeft, setSecondsLeft] = useState(RESEND_SECONDS);
  const [resending, setResending] = useState(false);
  const tickRef = useRef<number | null>(null);
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

  const onSubmit = useCallback(
    async (values: OtpInput) => {
      if (!phone) return;
      setSubmitting(true);
      try {
        await apiFetch<{ user_id: string }>("/api/auth/verify", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            phone,
            otp: values.otp,
            device_label: deriveDeviceLabel(
              typeof navigator === "undefined" ? null : navigator.userAgent,
            ),
          }),
          skipRefresh: true,
        });
        sessionStorage.removeItem(PENDING_PHONE_KEY);
        await refresh();
        router.replace(safeReturnTo(searchParams.get("returnTo")));
      } catch (err) {
        applyError(err, {
          setError: form.setError,
          fieldMap: { invalid_otp: "otp", validation_failed: "otp" },
          clear: { setValue: form.setValue, fields: ["otp"] },
        });
      } finally {
        setSubmitting(false);
      }
    },
    [phone, refresh, router, form, searchParams],
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
    if (!phone || secondsLeft > 0 || resending) return;
    setResending(true);
    try {
      await apiFetch("/api/auth/request-otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ phone }),
        skipRefresh: true,
      });
      setSecondsLeft(RESEND_SECONDS);
      toast.success("New code sent.");
    } catch (err) {
      applyError(err, { setError: form.setError });
    } finally {
      setResending(false);
    }
  }

  if (!phone) {
    return null;
  }

  const otpError = form.formState.errors.otp?.message;

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
      <label
        htmlFor="otp"
        className="block font-mono uppercase tracking-[0.16em] text-[10px] text-white/45 mb-3"
      >
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
        disabled={submitting}
        inputMode="numeric"
        containerClassName="gap-2"
      >
        <InputOTPGroup className="gap-2">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <InputOTPSlot
              key={i}
              index={i}
              className="h-14 w-12 rounded-xl border border-white/18 bg-white/[0.04] text-white text-xl font-semibold first:rounded-xl last:rounded-xl"
            />
          ))}
        </InputOTPGroup>
      </InputOTP>

      {otpError && (
        <p className="mt-3 text-sm text-red-400" role="alert">
          {otpError}
        </p>
      )}

      <p className="mt-6 text-[14px] text-white/55">
        Code sent to <span className="text-white/85">{maskPhone(phone)}</span>.{" "}
        <button
          type="button"
          onClick={() => router.push("/auth")}
          className="text-white/70 underline-offset-2 hover:underline"
        >
          Wrong number?
        </button>
      </p>

      <div className="mt-3 text-[14px] text-white/55">
        {secondsLeft > 0 ? (
          <span>Resend available in {secondsLeft}s</span>
        ) : (
          <button
            type="button"
            onClick={handleResend}
            disabled={resending}
            className="text-orange hover:text-orange/80 disabled:opacity-60"
          >
            {resending ? "Sending…" : "Send a new code"}
          </button>
        )}
      </div>

      <button
        type="submit"
        disabled={!form.formState.isValid || submitting}
        className="mt-7 w-full inline-flex items-center justify-center gap-2 h-14 rounded-full text-[16.5px] font-semibold transition-colors bg-orange text-white enabled:hover:bg-orange/90 disabled:bg-white/8 disabled:text-white/35 disabled:cursor-not-allowed"
      >
        <span>{submitting ? "Verifying…" : "Verify code"}</span>
      </button>
    </form>
  );
}
