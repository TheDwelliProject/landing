import Link from "next/link";
import { Suspense } from "react";
import { Logo } from "@/components/logo";
import { Container } from "@/components/container";
import { SignInForm } from "@/components/sign-in-form";

const INTENT_LABELS: Record<string, string> = {
  "list-property": "List your property",
};

export const metadata = {
  title: "Sign in — Dwelli",
  description:
    "Enter your number to continue. We'll text you a six-digit code — no passwords to remember.",
};

type Reason = "session-compromised" | "session-expired";

const REASON_COPY: Record<
  Reason,
  { title: string; body: string; tone: "danger" | "info" }
> = {
  "session-compromised": {
    title: "Signed out for your security",
    body: "Your session was used somewhere unexpected. If you didn't sign in elsewhere, please contact support.",
    tone: "danger",
  },
  "session-expired": {
    title: "Session ended",
    body: "Please sign in again to continue where you left off.",
    tone: "info",
  },
};

function parseReason(value: string | undefined): Reason | undefined {
  return value === "session-compromised" || value === "session-expired"
    ? value
    : undefined;
}

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string; reason?: string }>;
}) {
  const { intent, reason } = await searchParams;
  const intentLabel = intent ? INTENT_LABELS[intent] : undefined;
  const reasonNotice = parseReason(reason);
  const reasonCopy = reasonNotice ? REASON_COPY[reasonNotice] : undefined;

  return (
    <div className="min-h-screen bg-charcoal text-white flex flex-col">
      <Container as="header" className="pt-7">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center">
            <Logo
              size={22}
              variant="white-on-orange"
              wordmarkClassName="text-[18px] text-white"
            />
          </Link>
          <span className="font-mono uppercase tracking-[0.16em] text-[10px] text-white/45">
            Communities
          </span>
        </div>
      </Container>

      <main className="flex-1 flex items-center">
        <Container>
          <div className="max-w-[460px] mx-auto sm:mx-0">
            <div className="flex items-center gap-2 mb-7">
              <span className="w-1.5 h-1.5 rounded-full bg-orange" />
              <span className="font-mono uppercase tracking-[0.16em] text-[11px] text-orange">
                Secure sign-in
              </span>
            </div>

            <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
              Enter your number to{" "}
              <span className="font-serif font-normal italic tracking-tight">
                continue
              </span>
              .
            </h1>

            <p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[420px]">
              We&rsquo;ll text you a six-digit code. No passwords to remember,
              ever.
            </p>

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
                  <span className="text-white font-semibold">{intentLabel}</span>
                </span>
              </div>
            )}

            {reasonCopy && (
              <div
                role="alert"
                className={`mt-8 rounded-xl border px-4 py-3 ${
                  reasonCopy.tone === "danger"
                    ? "border-red-400/40 bg-red-500/10"
                    : "border-white/12 bg-white/5"
                }`}
              >
                <p
                  className={`text-[13px] font-semibold ${
                    reasonCopy.tone === "danger" ? "text-red-200" : "text-white/85"
                  }`}
                >
                  {reasonCopy.title}
                </p>
                <p
                  className={`mt-1 text-[13px] leading-[1.5] ${
                    reasonCopy.tone === "danger" ? "text-red-100/85" : "text-white/65"
                  }`}
                >
                  {reasonCopy.body}
                </p>
              </div>
            )}

            <Suspense fallback={null}>
              <SignInForm />
            </Suspense>

            <p className="mt-7 font-mono uppercase tracking-[0.16em] text-[10px] text-white/40">
              By continuing you agree to our{" "}
              <Link href="#terms" className="text-white/70 hover:text-white">
                terms
              </Link>{" "}
              &amp;{" "}
              <Link href="#privacy" className="text-white/70 hover:text-white">
                privacy
              </Link>
            </p>
          </div>
        </Container>
      </main>
    </div>
  );
}
