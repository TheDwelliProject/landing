import Link from "next/link";
import { Logo } from "./logo";
import { Container } from "./container";

const COLUMNS: { title: string; links: { label: string; href: string }[] }[] = [
  {
    title: "Product",
    links: [
      { label: "How it works", href: "#how" },
      { label: "Pricing", href: "#pricing" },
      { label: "For residents", href: "#residents" },
      { label: "Security", href: "#security" },
    ],
  },
  {
    title: "Company",
    links: [
      { label: "About", href: "#about" },
      { label: "Careers", href: "#careers" },
      { label: "Contact", href: "#contact" },
      { label: "Blog", href: "#blog" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Terms", href: "#terms" },
      { label: "Privacy", href: "#privacy" },
      { label: "Cookies", href: "#cookies" },
    ],
  },
];

export default function Footer() {
  return (
    <footer className="bg-charcoal text-white">
      <Container className="pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-[1.2fr_2fr] gap-12">
          <div>
            <Logo
              size={24}
              variant="white"
              wordmarkClassName="text-[18px] text-white"
            />
            <p className="mt-5 text-sm text-white/50 leading-relaxed max-w-[280px]">
              The operating system for residential communities in Nigeria.
            </p>
          </div>

          <div className="grid grid-cols-3 gap-8 md:justify-self-end md:text-right">
            {COLUMNS.map((col) => (
              <div key={col.title}>
                <div className="font-mono uppercase tracking-[0.16em] text-[11px] text-white/45 mb-4">
                  {col.title}
                </div>
                <ul className="space-y-3 text-sm text-white/80">
                  {col.links.map((l) => (
                    <li key={l.label}>
                      <Link
                        href={l.href}
                        className="hover:text-white transition-colors"
                      >
                        {l.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-14 pt-6 border-t border-white/10 flex flex-col sm:flex-row gap-3 sm:justify-between text-xs text-white/45 font-mono">
          <span>
            © 2026 Dwelli Technologies Limited · 38 Baale Bus Stop, Ipaja, Lagos
          </span>
          <span className="uppercase tracking-[0.16em]">Made in Lagos</span>
        </div>
      </Container>
    </footer>
  );
}
