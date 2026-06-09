import Link from "next/link";
import { Suspense } from "react";
import { Container } from "@/components/container";
import { Logo } from "@/components/logo";
import { OtpForm } from "@/components/otp-form";

const INTENT_LABELS: Record<string, string> = {
  "list-property": "List your property",
};

export const metadata = {
  title: "Enter your code — Dwelli",
  description:
    "We just texted you a six-digit code. Enter it to finish signing in.",
};

export default async function VerifyPage({
  searchParams,
}: {
  searchParams: Promise<{ intent?: string }>;
}) {
  const { intent } = await searchParams;
  const intentLabel = intent ? INTENT_LABELS[intent] : undefined;

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
                Verify
              </span>
            </div>

            <h1 className="font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-[clamp(2.25rem,5vw,2.75rem)]">
              Enter the{" "}
              <span className="font-serif font-normal italic tracking-tight">
                code
              </span>{" "}
              we texted you.
            </h1>

            <p className="mt-6 text-[16px] leading-[1.55] text-white/65 max-w-[420px]">
              Six digits, valid for a few minutes. If it doesn&rsquo;t arrive,
              you can request a new one below.
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

            <Suspense fallback={null}>
              <OtpForm />
            </Suspense>
          </div>
        </Container>
      </main>
    </div>
  );
}
