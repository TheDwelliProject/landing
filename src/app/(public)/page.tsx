import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { CtaButton } from "@/components/cta-button";
import { LogoMark } from "@/components/logo";
import { Container } from "@/components/container";

const SECTION_LABEL =
  "font-mono uppercase tracking-[0.16em] text-[11px] text-[#7A746B]";
const HEADING =
  "font-display font-extrabold tracking-[-0.04em] leading-[1.02] text-charcoal";
const ITALIC = "font-serif font-normal italic tracking-tight";
const BODY_MUTED = "text-[17px] leading-[1.55] text-[#4A463F]";

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col">
      <Navbar />

      <main className="flex-1">
        {/* ── Hero ── */}
        <section className="pt-14 pb-20 sm:pt-20 sm:pb-28">
          <Container className="grid grid-cols-1 lg:grid-cols-[1fr_1fr] gap-10 lg:gap-12 items-start">
            <div>
              <div className="flex items-center gap-2 mb-7">
                <span className="w-1.5 h-1.5 rounded-full bg-orange" />
                <span className="font-mono uppercase tracking-[0.16em] text-[11px] text-orange">
                  For owners &amp; managers · Lagos
                </span>
              </div>

              <h1
                className={`${HEADING} text-[clamp(2.75rem,6vw,4.5rem)]`}
              >
                Run a building,
                <br />
                <span className={ITALIC}>not</span> a war room.
              </h1>

              <p className={`mt-7 max-w-[450px] ${BODY_MUTED} text-[19px]`}>
                Rent, maintenance, visitor passes and payouts — every unit in
                one place. List your property and invite residents in minutes.
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <CtaButton
                  href="/auth?intent=list-property"
                  variant="primary"
                  size="md"
                >
                  List your property
                </CtaButton>
                <CtaButton
                  href="#how"
                  variant="secondary"
                  size="md"
                  showArrow={false}
                >
                  See how it works
                </CtaButton>
              </div>

              <div className="mt-12 font-mono uppercase tracking-[0.16em] text-[10.5px] text-[#7A746B]">
                Free for residents · ₦2,500 / unit / mo · A few estates each week
              </div>
            </div>

            <div className="lg:mt-2">
              <div className="aspect-[4/3] w-full rounded-[28px] bg-[repeating-linear-gradient(135deg,#ECE7DC_0,#ECE7DC_2px,transparent_2px,transparent_14px)] bg-[#F0EBE0] flex items-center justify-center">
                <span className="font-mono text-[13px] text-charcoal/35">
                  ↳ product shot — owner dashboard
                </span>
              </div>
            </div>
          </Container>
        </section>

        {/* ── How it works ── */}
        <section id="how" className="bg-white">
          <Container className="py-20">
            <div className={SECTION_LABEL}>How it works</div>
            <h2 className={`${HEADING} mt-3 text-[clamp(2rem,4vw,2.75rem)]`}>
              Live in a day, not a <span className={ITALIC}>quarter</span>.
            </h2>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-3 gap-5">
              {[
                {
                  n: "01",
                  title: "List your property",
                  body: "Tell us the basics about your building. Takes about two minutes.",
                },
                {
                  n: "02",
                  title: "Invite your residents",
                  body: "Share one link. Everyone who joins gets the view that fits their role.",
                },
                {
                  n: "03",
                  title: "Run it from your phone",
                  body: "Rent, repairs, the gate and your payout — all in your pocket.",
                },
              ].map((s) => (
                <div
                  key={s.n}
                  className="rounded-[22px] border border-charcoal/10 bg-white p-7 min-h-[200px]"
                >
                  <div className="font-display font-extrabold text-[28px] text-orange leading-none">
                    {s.n}
                  </div>
                  <h3 className="mt-6 font-display font-extrabold tracking-[-0.02em] text-[19px] text-charcoal">
                    {s.title}
                  </h3>
                  <p className="mt-3 text-[15px] leading-[1.55] text-[#4A463F]">
                    {s.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── What you get ── */}
        <section id="product" className="bg-cream">
          <Container className="py-20">
            <div className={SECTION_LABEL}>What you get</div>
            <h2 className={`${HEADING} mt-3 text-[clamp(2rem,4vw,2.75rem)]`}>
              The whole building, <span className={ITALIC}>handled</span>.
            </h2>

            <div className="mt-12 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                {
                  bg: "bg-orange",
                  glyph: "₦",
                  title: "Rent that lands on time",
                  body: "Tenants pay in-app. You get one clean payout at month-end — in your account the next morning.",
                },
                {
                  bg: "bg-blue",
                  glyph: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M14 6a4 4 0 0 0-5.66 5.66l-5.17 5.17a2 2 0 1 0 2.83 2.83l5.17-5.17A4 4 0 0 0 17.41 9L14 12.41l-2.41-2.41L15 6.59A4 4 0 0 1 14 6z"
                        fill="currentColor"
                      />
                    </svg>
                  ),
                  title: "Maintenance, routed",
                  body: "Residents report a problem. Dwelli assigns it. You only approve the big-ticket ones.",
                },
                {
                  bg: "bg-green",
                  glyph: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="4"
                        y="3"
                        width="16"
                        height="18"
                        rx="2"
                        stroke="currentColor"
                        strokeWidth="1.8"
                      />
                      <path
                        d="M8 7h8M8 11h8M8 15h5"
                        stroke="currentColor"
                        strokeWidth="1.8"
                        strokeLinecap="round"
                      />
                    </svg>
                  ),
                  title: "Passes at the gate",
                  body: "Residents generate visitor codes. Security waves them through. No paper logbook.",
                },
                {
                  bg: "bg-pink",
                  glyph: (
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      aria-hidden="true"
                    >
                      <rect
                        x="3"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="3"
                        width="7"
                        height="7"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="3"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                        fill="currentColor"
                      />
                      <rect
                        x="14"
                        y="14"
                        width="7"
                        height="7"
                        rx="1"
                        fill="currentColor"
                      />
                    </svg>
                  ),
                  title: "One clear ledger",
                  body: "Every unit, every payment, every open ticket — in one place, always current.",
                },
              ].map((c, i) => (
                <div
                  key={i}
                  className={`${c.bg} text-white rounded-[22px] p-8 min-h-[230px] flex flex-col`}
                >
                  <div className="w-11 h-11 rounded-[12px] bg-white/22 flex items-center justify-center text-white font-display font-extrabold text-[18px]">
                    {c.glyph}
                  </div>
                  <h3 className="mt-12 font-display font-extrabold tracking-[-0.02em] text-[26px] leading-tight">
                    {c.title}
                  </h3>
                  <p className="mt-4 text-[15px] leading-[1.55] text-white/85 max-w-[460px]">
                    {c.body}
                  </p>
                </div>
              ))}
            </div>
          </Container>
        </section>

        {/* ── Testimonial ── */}
        <section className="bg-charcoal text-white">
          <Container className="py-20">
            <div className="font-mono uppercase tracking-[0.16em] text-[11px] text-orange">
              From a Dwelli manager
            </div>
            <blockquote className="mt-8 font-serif italic font-normal text-[clamp(2rem,4vw,2.875rem)] leading-[1.18] tracking-[-0.01em] max-w-[900px]">
              “We collected 100% of May rent in May. That never happened in
              seven years of WhatsApp and bank transfers.”
            </blockquote>
            <div className="mt-10 flex items-center gap-4">
              <span className="w-11 h-11 rounded-full bg-orange flex items-center justify-center font-display font-extrabold text-white">
                A
              </span>
              <div>
                <div className="font-medium text-[15px]">Adaeze Okeke</div>
                <div className="font-mono uppercase tracking-[0.16em] text-[10.5px] text-white/55 mt-0.5">
                  Adekoya Court · 12 units
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── Pricing ── */}
        <section id="pricing" className="bg-white">
          <Container className="py-20">
            <div className="grid grid-cols-1 lg:grid-cols-[1.1fr_1fr] gap-12 items-start">
              <div>
                <div className={SECTION_LABEL}>Pricing</div>
                <h2
                  className={`${HEADING} mt-3 text-[clamp(2rem,4vw,2.75rem)]`}
                >
                  Free for residents.
                  <br />
                  Fair for <span className={ITALIC}>owners</span>.
                </h2>
                <p className="mt-6 max-w-[420px] text-[15px] leading-[1.55] text-[#4A463F]">
                  No setup fees. No cut of your rent. You pay only for occupied
                  units — nothing for empty ones.
                </p>
              </div>

              <div className="bg-cream rounded-[22px] p-8 max-w-[420px] lg:justify-self-end w-full">
                <div className="font-mono uppercase tracking-[0.16em] text-[11px] text-orange">
                  Owners &amp; managers
                </div>
                <div className="mt-5 flex items-baseline gap-2">
                  <span className="font-display font-extrabold tracking-[-0.03em] text-[44px] text-charcoal leading-none">
                    ₦2,500
                  </span>
                  <span className="text-[14px] text-charcoal/55">
                    / occupied unit / mo
                  </span>
                </div>
                <ul className="mt-7 space-y-3 text-[14.5px] text-charcoal">
                  {[
                    "No transaction cuts, ever",
                    "Free for every resident",
                    "Cancel anytime",
                  ].map((item) => (
                    <li key={item} className="flex items-center gap-3">
                      <span className="w-5 h-5 rounded-full bg-green flex items-center justify-center">
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
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="mt-8">
                  <CtaButton
                    href="/auth?intent=list-property"
                    variant="primary"
                    size="md"
                    fullWidth
                  >
                    List your property
                  </CtaButton>
                </div>
              </div>
            </div>
          </Container>
        </section>

        {/* ── CTA card ── */}
        <section className="bg-cream">
          <Container className="pt-4 pb-16">
            <div className="relative overflow-hidden bg-orange text-white rounded-[28px] px-8 sm:px-12 py-20 sm:py-24">
              <LogoMark
                size={420}
                variant="white-on-orange"
                className="absolute -right-12 -bottom-24 opacity-25 pointer-events-none"
              />
              <div className="relative max-w-[700px] mx-auto text-center">
                <h2 className="font-display font-extrabold tracking-[-0.035em] leading-[0.96] text-[clamp(2.5rem,5vw,3.75rem)]">
                  Run a building,
                  <br />
                  <span className={ITALIC}>not</span> a war room.
                </h2>
                <div className="mt-9 flex justify-center">
                  <CtaButton
                    href="/auth?intent=list-property"
                    variant="light"
                    size="md"
                    className="font-bold"
                  >
                    List your property
                  </CtaButton>
                </div>
                <div className="mt-7 font-mono uppercase tracking-[0.16em] text-[11px] text-white/75">
                  Dwelli onboards a handful of estates each week
                </div>
              </div>
            </div>
          </Container>
        </section>
      </main>

      <Footer />
    </div>
  );
}
