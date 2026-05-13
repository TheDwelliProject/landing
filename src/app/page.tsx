import Image from "next/image";
import FAQ from "@/components/faq";

function DwelliLogoLight({ className = "" }: { className?: string }) {
  return (
    <Image
      src="/logos/logo-pink-keyhole-wordmark.png"
      alt="dwelli"
      width={120}
      height={32}
      className={className}
    />
  );
}

/** A scalloped 12-petal "flower" decoration used in the brutalist-playful design. */
function Flower({ className = "", color = "currentColor" }: { className?: string; color?: string }) {
  // 12 evenly distributed circular "petals" arranged around a center circle.
  const petals = Array.from({ length: 12 }, (_, i) => {
    const angle = (i / 12) * Math.PI * 2;
    const r = 38;
    const cx = 60 + Math.cos(angle) * r;
    const cy = 60 + Math.sin(angle) * r;
    return <circle key={i} cx={cx} cy={cy} r={18} fill={color} />;
  });
  return (
    <svg
      viewBox="0 0 120 120"
      className={className}
      aria-hidden="true"
    >
      {petals}
      <circle cx={60} cy={60} r={28} fill={color} />
    </svg>
  );
}

function ArrowCircle({
  className = "",
  bg = "bg-white/15",
  text = "text-white",
}: {
  className?: string;
  bg?: string;
  text?: string;
}) {
  return (
    <span
      className={`inline-flex items-center justify-center w-10 h-10 rounded-full ${bg} ${text} ${className}`}
      aria-hidden="true"
    >
      <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
        <path
          d="M2 7h10M8 3l4 4-4 4"
          stroke="currentColor"
          strokeWidth="1.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
    </span>
  );
}

export default function Home() {
  return (
    <div className="min-h-screen">
      {/* ── Nav ── (full-width black pill on cream) */}
      <div className="bg-cream pt-4 sm:pt-6">
        <nav className="flex items-center justify-between bg-charcoal text-white rounded-full pl-3 sm:pl-4 pr-1.5 py-1.5">
          <Image
            src="/logos/logo-dark-keyhole-wordmark.png"
            alt="dwelli"
            width={120}
            height={32}
          />
          <div className="hidden sm:flex items-center gap-8 text-sm">
            <a href="#residents" className="text-white/80 hover:text-white">
              Residents
            </a>
            <a href="#owners" className="text-white/80 hover:text-white">
              Owners
            </a>
            <a href="#faq" className="text-white/80 hover:text-white">
              FAQ
            </a>
          </div>
          <div className="flex items-center gap-2">
            <a
              href="#signup"
              className="bg-orange text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-orange/90 transition-colors"
            >
              Sign up
            </a>
            <button
              type="button"
              aria-label="Menu"
              className="sm:hidden w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white"
            >
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                <path
                  d="M2 5h12M2 11h12"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                />
              </svg>
            </button>
          </div>
        </nav>
      </div>

      {/* ── Hero ── */}
      <section className="relative bg-orange text-white px-6 sm:px-10 lg:px-16 pt-12 sm:pt-20 pb-20 sm:pb-32 overflow-hidden">
        {/* Decorative flower */}
        <Flower
          color="#FF7A2E"
          className="absolute top-6 right-6 sm:top-12 sm:right-12 w-28 h-28 sm:w-40 sm:h-40 opacity-90 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="mb-8">
            <span className="inline-flex items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-white/80 font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-white inline-block" />
              Now in private beta &middot; Lagos
            </span>
          </div>

          <h1 className="text-[clamp(3rem,12vw,12rem)] leading-[0.85] font-medium tracking-[-0.05em] max-w-[1100px] mb-10 sm:mb-16">
            Run your
            <br />
            building.
            <br />
            <span className="font-serif italic font-normal tracking-[-0.025em]">
              Live in it.
            </span>
          </h1>

          <div className="grid sm:grid-cols-2 gap-12 max-w-3xl">
            <p className="text-[clamp(1.1rem,2.5vw,1.375rem)] leading-relaxed text-white/90 max-w-[560px]">
              Dwelli is one app for everyone with a key — landlord, tenant,
              manager, gateman. Rent, access, repairs, utilities.{" "}
              <strong className="font-semibold text-white">Settled.</strong>
            </p>

            <div className="flex flex-col gap-3">
              <div className="flex items-center bg-white rounded-full p-1.5 gap-1 w-full max-w-md">
                <input
                  type="email"
                  placeholder="you@home.com"
                  className="flex-1 bg-transparent outline-none text-charcoal placeholder:text-charcoal/40 px-3 sm:px-4 py-2 text-sm min-w-0"
                />
                <a
                  href="#signup"
                  className="bg-charcoal text-white px-4 sm:px-5 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal/90 transition-colors whitespace-nowrap shrink-0"
                >
                  <span className="hidden sm:inline">Get on the list</span>
                  <span className="sm:hidden">Get on list</span>{" "}
                  &rarr;
                </a>
              </div>
              <span className="text-[11px] tracking-[0.14em] uppercase text-white/70 font-mono">
                Free for residents &middot; &#8358;2,500/unit for owners
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* ── 01 Capabilities ── */}
      <section className="bg-cream text-charcoal px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8 sm:mb-12 text-[11px] tracking-[0.14em] uppercase font-mono text-charcoal/55">
            <span>// 01 — Capabilities</span>
            <span className="hidden sm:inline">4 ways Dwelli helps</span>
          </div>
          <h2 className="sm:hidden text-4xl font-medium tracking-tight mb-10">
            4 ways Dwelli helps
          </h2>

          {/* Asymmetric grid: Rent (2/3) + Access (1/3) ; Repairs (1/3) + Utility (2/3) */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {/* Rent — 2/3 */}
            <div className="sm:col-span-2 bg-charcoal text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[380px] relative">
              <ArrowCircle className="absolute top-5 right-5" bg="bg-white/10" />
              <div className="mb-auto">
                <div className="text-xs font-mono text-white/55 mb-2 tracking-wider uppercase">
                  01 / Rent
                </div>
                <h3 className="text-2xl sm:text-[34px] leading-tight tracking-tight font-medium mb-3">
                  Rent that arrives.
                </h3>
                <p className="text-sm text-white/65 max-w-xs">
                  Autopay, reminders, receipts, late nudges. Set it once.
                </p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 mt-6">
                <div>
                  <div className="text-[11px] uppercase tracking-wider text-white/45 font-mono mb-2">
                    This month
                  </div>
                  <div className="text-4xl sm:text-5xl font-medium tracking-tight mb-1">
                    &#8358;5.4M
                  </div>
                  <div className="text-xs text-white/55 mb-3">
                    collected &middot; Adekoya Court
                  </div>
                  <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-orange rounded-full"
                      style={{ width: "92%" }}
                    />
                  </div>
                  <div className="text-[11px] text-white/45 mt-2 font-mono uppercase tracking-wider">
                    11 of 12 units in
                  </div>
                </div>
                <div className="hidden sm:block">
                  <div className="text-[11px] uppercase tracking-wider text-white/45 font-mono mb-2">
                    Ledger
                  </div>
                  <div className="space-y-1.5 text-xs">
                    <div className="flex justify-between">
                      <span>Unit 4B &middot; Chika</span>
                      <span>&#8358;450k</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Unit 7A &middot; Tunde</span>
                      <span>&#8358;450k</span>
                    </div>
                    <div className="flex justify-between text-white/50">
                      <span>Unit 9C &middot; Adaeze</span>
                      <span>Late &middot; 3d</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Access — 1/3 */}
            <div className="bg-blue text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[380px] relative">
              <ArrowCircle className="absolute top-5 right-5" bg="bg-white/15" />
              <div className="mb-auto">
                <div className="text-xs font-mono text-white/70 mb-2 tracking-wider uppercase">
                  02 / Access
                </div>
                <h3 className="text-2xl sm:text-[28px] leading-tight tracking-tight font-medium mb-3">
                  Open the gate from anywhere.
                </h3>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-4 mt-6">
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-mono mb-2">
                  Visitor pass
                </div>
                <div className="text-sm mb-1">
                  For <strong className="font-semibold">Plumber</strong>
                </div>
                <div className="text-xs text-white/70 mb-3">
                  Today &middot; 4&ndash;6pm
                </div>
                <div className="text-[11px] uppercase tracking-wider text-white/70 font-mono mb-1">
                  Code
                </div>
                <div className="text-3xl font-mono font-medium tracking-wider">
                  84&middot;17
                </div>
              </div>
            </div>

            {/* Repairs — 1/3 */}
            <div className="bg-green text-white rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[380px] relative">
              <ArrowCircle className="absolute top-5 right-5" bg="bg-white/15" />
              <div className="mb-auto">
                <div className="text-xs font-mono text-white/75 mb-2 tracking-wider uppercase">
                  03 / Repairs
                </div>
                <h3 className="text-2xl sm:text-[28px] leading-tight tracking-tight font-medium mb-3">
                  Fixed before lunch.
                </h3>
              </div>
              <div className="bg-white/15 backdrop-blur rounded-xl p-4 mt-6">
                <div className="text-[11px] font-mono text-white/70 mb-2 uppercase tracking-wider">
                  Ticket &middot; #214
                </div>
                <div className="text-sm font-medium mb-3">
                  Kitchen tap leaking &middot; 12B
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span className="text-white/70">Reported 9:14am</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white/60" />
                    <span className="text-white/80">
                      Assigned Tunde &middot; 9:18am
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-white" />
                    <span>On the way now</span>
                  </div>
                  <div className="text-white/55 mt-1">Sign off pending</div>
                </div>
              </div>
            </div>

            {/* Utility — 2/3 */}
            <div className="sm:col-span-2 bg-amber text-charcoal rounded-2xl sm:rounded-3xl p-6 sm:p-8 flex flex-col min-h-[320px] sm:min-h-[380px] relative">
              <ArrowCircle
                className="absolute top-5 right-5"
                bg="bg-charcoal/10"
                text="text-charcoal"
              />
              <div className="mb-auto">
                <div className="text-xs font-mono text-charcoal/55 mb-2 tracking-wider uppercase">
                  04 / Utility
                </div>
                <h3 className="text-2xl sm:text-[34px] leading-tight tracking-tight font-medium mb-3">
                  Bills, meters, top-ups.
                </h3>
                <p className="text-sm text-charcoal/65 max-w-xs">
                  No queues at the PHCN office.
                </p>
              </div>
              <div className="grid grid-cols-3 gap-3 sm:gap-5 mt-6">
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-charcoal/55 font-mono mb-2">
                    PHCN
                  </div>
                  <div className="text-lg sm:text-2xl font-medium mb-2">
                    <span className="sm:hidden">&#8358;5.2k</span>
                    <span className="hidden sm:inline">&#8358;5,200</span>
                  </div>
                  <div className="h-1.5 w-full bg-charcoal/15 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-charcoal rounded-full"
                      style={{ width: "55%" }}
                    />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-charcoal/55 font-mono">
                    24 units left
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-charcoal/55 font-mono mb-2">
                    Water
                  </div>
                  <div className="text-lg sm:text-2xl font-medium mb-2">
                    24 m&sup3;
                  </div>
                  <div className="h-1.5 w-full bg-charcoal/15 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-charcoal rounded-full"
                      style={{ width: "70%" }}
                    />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-charcoal/55 font-mono">
                    -8 vs avg
                  </div>
                </div>
                <div>
                  <div className="text-[10px] sm:text-[11px] uppercase tracking-wider text-charcoal/55 font-mono mb-2">
                    Cable
                  </div>
                  <div className="text-lg sm:text-2xl font-medium mb-2">
                    Active
                  </div>
                  <div className="h-1.5 w-full bg-charcoal/15 rounded-full overflow-hidden mb-2">
                    <div
                      className="h-full bg-charcoal rounded-full"
                      style={{ width: "85%" }}
                    />
                  </div>
                  <div className="text-[9px] sm:text-[10px] text-charcoal/55 font-mono">
                    Renews 14 Jun
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── 02 For Residents ── */}
      <section
        id="residents"
        className="bg-cream-light text-charcoal px-6 sm:px-10 lg:px-16 py-16 sm:py-24"
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-baseline justify-between mb-8 sm:mb-12 text-[11px] tracking-[0.14em] uppercase font-mono text-charcoal/55">
            <span>// 02 — For residents</span>
            <span className="hidden sm:inline">Free, forever</span>
          </div>

          <h2 className="text-[clamp(2.5rem,8vw,6rem)] leading-[0.95] font-medium tracking-tight mb-12 sm:mb-16 max-w-4xl">
            Your home,{" "}
            <span className="font-serif italic font-normal">
              without the chase
            </span>
            <span className="text-charcoal/40">.</span>
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
            {[
              {
                num: "01",
                title: "Pay rent in two taps",
                body: "Autopay for next month. Receipts ready before the bank email arrives.",
                arrowBg: "bg-orange",
              },
              {
                num: "02",
                title: "Open the gate, anywhere",
                body: "Generate visitor codes. See who arrived. Make the gateman like you.",
                arrowBg: "bg-blue",
              },
              {
                num: "03",
                title: "Get the leak fixed",
                body: "Snap a photo. Track who is on the way. Sign off when they leave.",
                arrowBg: "bg-green",
              },
            ].map((it) => (
              <div
                key={it.num}
                className="bg-white border border-charcoal/10 rounded-2xl p-6 sm:p-7 min-h-[260px] flex flex-col"
              >
                <div className="text-xs font-mono text-charcoal/45 mb-3 tracking-wider">
                  #{it.num}
                </div>
                <h3 className="text-xl sm:text-[22px] font-medium tracking-tight mb-3">
                  {it.title}
                </h3>
                <p className="text-sm text-charcoal/60 leading-relaxed mb-8">
                  {it.body}
                </p>
                <div className="mt-auto flex justify-end">
                  <ArrowCircle bg={it.arrowBg} text="text-white" />
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── 03 For Owners ── */}
      <section
        id="owners"
        className="relative bg-charcoal text-white px-6 sm:px-10 lg:px-16 py-16 sm:py-24 overflow-hidden"
      >
        {/* Pink decorative flower */}
        <Flower
          color="#D0318D"
          className="absolute top-8 right-8 sm:top-14 sm:right-14 w-20 h-20 sm:w-28 sm:h-28 opacity-95 pointer-events-none"
        />

        <div className="max-w-7xl mx-auto relative">
          <div className="flex items-baseline justify-between mb-8 sm:mb-12 text-[11px] tracking-[0.14em] uppercase font-mono text-white/55">
            <span>// 03 — For owners &amp; managers</span>
            <span className="hidden sm:inline pr-32">
              &#8358;2,500 &middot; per unit &middot; per month
            </span>
          </div>

          <h2 className="text-[clamp(2.75rem,9vw,7rem)] leading-[0.92] font-medium tracking-tight mb-12 sm:mb-16 max-w-4xl">
            Buildings,{" "}
            <span className="font-serif italic font-normal">not</span>{" "}
            bookkeeping.
          </h2>

          {/* Portfolio + status grid */}
          <div className="grid lg:grid-cols-2 gap-4 sm:gap-5 mb-12 sm:mb-16">
            {/* Portfolio card */}
            <div className="bg-white/[0.06] rounded-2xl p-6 sm:p-8">
              <div className="flex items-baseline justify-between mb-6">
                <span className="text-[11px] uppercase tracking-wider text-white/55 font-mono">
                  Portfolio &middot; May
                </span>
              </div>
              <div className="text-4xl sm:text-5xl font-medium tracking-tight mb-1">
                &#8358;14.2M
              </div>
              <div className="text-sm text-white/55 mb-8">
                collected across 38 units
              </div>

              <div className="space-y-5">
                {[
                  {
                    name: "Adekoya Court · Yaba",
                    amount: "₦5.4M",
                    units: "12 / 12",
                    pct: 100,
                    color: "bg-green",
                  },
                  {
                    name: "Lekki Walk-up · Phase 1",
                    amount: "₦3.6M",
                    units: "8 / 8",
                    pct: 100,
                    color: "bg-green",
                  },
                  {
                    name: "Yaba Annex · Sabo",
                    amount: "₦5.2M",
                    units: "14 / 18",
                    pct: 78,
                    color: "bg-orange",
                  },
                ].map((p) => (
                  <div key={p.name}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="text-sm font-medium">{p.name}</div>
                      <div className="text-right">
                        <span className="text-sm font-medium">{p.amount}</span>
                        <span className="text-xs text-white/45 ml-3 font-mono">
                          {p.units}
                        </span>
                      </div>
                    </div>
                    <div className="h-1 w-full bg-white/10 rounded-full overflow-hidden">
                      <div
                        className={`h-full ${p.color} rounded-full`}
                        style={{ width: `${p.pct}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Status cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
              {[
                {
                  label: "Payouts",
                  title: "Mon 2 Jun · ₦4.95M",
                  body: "Next sweep to your bank.",
                  dot: "bg-green",
                },
                {
                  label: "Maintenance",
                  title: "3 open · 1 urgent",
                  body: "Routed. Approve big ones.",
                  dot: "bg-orange",
                },
              ].map((c) => (
                <div
                  key={c.label}
                  className="bg-white/[0.06] rounded-2xl p-6 relative"
                >
                  <span
                    className={`absolute top-5 right-5 w-2 h-2 rounded-full ${c.dot}`}
                  />
                  <div className="text-[11px] uppercase tracking-wider text-white/55 font-mono mb-3">
                    {c.label}
                  </div>
                  <div className="text-lg font-medium mb-1">{c.title}</div>
                  <div className="text-xs text-white/55">{c.body}</div>
                </div>
              ))}
              <div className="bg-white/[0.06] rounded-2xl p-6 sm:col-span-2 relative">
                <span className="absolute top-5 right-5 w-2 h-2 rounded-full bg-pink" />
                <div className="text-[11px] uppercase tracking-wider text-white/55 font-mono mb-3">
                  Onboarding
                </div>
                <div className="text-lg font-medium mb-1">
                  2 tenants &middot; this week
                </div>
                <div className="text-xs text-white/55">KYC done in-app.</div>
              </div>
            </div>
          </div>
        </div>

        {/* Steps — full-width colored bands */}
        <div className="max-w-7xl mx-auto relative grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-5">
          {[
            {
              n: "01",
              title: "Add your home",
              body: "A unit, a building, or your whole estate. Setup takes a few minutes.",
              bg: "bg-charcoal border border-white/10",
              text: "text-white",
              labelText: "text-white/55",
              bodyText: "text-white/65",
            },
            {
              n: "02",
              title: "Invite the people",
              body: "Owners, tenants, managers, gateman, plumber. Each gets the view they need.",
              bg: "bg-amber",
              text: "text-charcoal",
              labelText: "text-charcoal/55",
              bodyText: "text-charcoal/70",
            },
            {
              n: "03",
              title: "Power on",
              body: "Rent flows in. Repairs flow out. The block runs itself.",
              bg: "bg-green",
              text: "text-white",
              labelText: "text-white/70",
              bodyText: "text-white/80",
            },
          ].map((s) => (
            <div
              key={s.n}
              className={`${s.bg} ${s.text} rounded-2xl p-6 sm:p-8 min-h-[200px] flex flex-col`}
            >
              <div
                className={`text-[11px] uppercase tracking-[0.14em] font-mono mb-auto ${s.labelText}`}
              >
                Step {s.n}
              </div>
              <h3 className="text-2xl sm:text-3xl font-medium tracking-tight mt-6 mb-2">
                {s.title}
              </h3>
              <p className={`text-sm leading-relaxed ${s.bodyText}`}>{s.body}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── 04 Testimonials ── */}
      <section className="bg-cream text-charcoal px-6 sm:px-10 lg:px-16 py-16 sm:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="mb-10 sm:mb-14 text-[11px] tracking-[0.14em] uppercase text-charcoal/55 font-mono">
            // 04 — From the block
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 sm:gap-12">
            {[
              {
                quote:
                  "My gateman went from 30 calls a week to zero. I went from sleeping at midnight to ten.",
                name: "Tunde",
                meta: "landlord, Lekki",
              },
              {
                quote:
                  "We collected 100% of May rent in May. That has literally never happened in seven years.",
                name: "Adaeze",
                meta: "manager, Adekoya",
              },
              {
                quote:
                  "Reported a leak at 9am, sorted by lunch. The paper trail is right there in the app.",
                name: "Chika",
                meta: "resident, Yaba",
              },
            ].map((t, i) => (
              <blockquote
                key={i}
                className="border-t border-charcoal/15 pt-6"
              >
                <p className="font-serif text-[1.5rem] sm:text-[1.75rem] leading-[1.25] mb-6">
                  &ldquo;{t.quote}&rdquo;
                </p>
                <footer className="text-xs uppercase tracking-[0.14em] font-mono text-charcoal/55">
                  <strong className="text-charcoal font-medium">
                    {t.name}
                  </strong>{" "}
                  &middot; {t.meta}
                </footer>
              </blockquote>
            ))}
          </div>
        </div>
      </section>

      {/* ── 05 FAQ ── */}
      <section
        id="faq"
        className="bg-cream-light text-charcoal px-6 sm:px-10 lg:px-16 py-16 sm:py-24"
      >
        <div className="max-w-7xl mx-auto grid lg:grid-cols-[1fr_2fr] gap-12 lg:gap-16">
          <div>
            <div className="mb-4 text-[11px] tracking-[0.14em] uppercase text-charcoal/55 font-mono">
              // 05 — FAQ
            </div>
            <h2 className="text-5xl sm:text-6xl font-medium tracking-tight mb-2">
              Quick{" "}
              <span className="font-serif italic font-normal">answers</span>
              <span className="text-charcoal/40">.</span>
            </h2>
            <p className="text-sm text-charcoal/55 mt-6">
              More?{" "}
              <a href="mailto:hello@dwelli.com" className="underline">
                hello@dwelli.com
              </a>
            </p>
          </div>

          <div>
            <FAQ />
          </div>
        </div>
      </section>

      {/* ── 06 CTA ── */}
      <section
        id="signup"
        className="relative bg-orange text-white px-6 sm:px-10 lg:px-16 py-20 sm:py-32 overflow-hidden"
      >
        <Flower
          color="#FF7A2E"
          className="absolute -bottom-12 -right-12 sm:-bottom-20 sm:-right-20 w-64 h-64 sm:w-96 sm:h-96 opacity-90 pointer-events-none"
        />
        <div className="max-w-7xl mx-auto relative">
          <div className="mb-8 text-[11px] tracking-[0.14em] uppercase text-white/70 font-mono">
            // 06 — Move in
          </div>

          <h2 className="text-[clamp(3rem,11vw,10rem)] leading-[0.9] font-medium tracking-tight mb-12 max-w-5xl">
            See you
            <br />
            <span className="font-serif italic font-normal">
              on the block
            </span>
            <span className="text-white/50">.</span>
          </h2>

          <div className="flex items-center bg-white rounded-full p-1.5 gap-1.5 w-full max-w-md">
            <input
              type="email"
              placeholder="you@home.com"
              className="flex-1 bg-transparent outline-none text-charcoal placeholder:text-charcoal/40 px-4 py-2 text-sm min-w-0"
            />
            <a
              href="#signup"
              className="bg-charcoal text-white px-5 py-2.5 rounded-full text-sm font-medium hover:bg-charcoal/90 transition-colors whitespace-nowrap"
            >
              Sign up &rarr;
            </a>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="bg-charcoal text-white px-6 sm:px-10 lg:px-16 py-12 sm:py-16">
        <div className="max-w-7xl mx-auto">
          <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-8 mb-12">
            <DwelliLogoLight />

            <div className="flex flex-wrap gap-x-8 gap-y-3 text-sm text-white/55">
              <a href="#residents" className="hover:text-white">
                Residents
              </a>
              <a href="#owners" className="hover:text-white">
                Owners
              </a>
              <a href="#faq" className="hover:text-white">
                FAQ
              </a>
              <a href="#" className="hover:text-white">
                Blog
              </a>
              <a href="#" className="hover:text-white">
                Instagram
              </a>
            </div>
          </div>

          <div className="border-t border-white/10 pt-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 text-xs text-white/40">
            <span>&copy; 2026 Dwelli Technologies Ltd.</span>
            <span>
              38 Baale Bus Stop, Ipaja, Lagos &middot; +234 810 164 4645
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
