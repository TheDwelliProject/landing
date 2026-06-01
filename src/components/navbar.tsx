"use client";

import Image from "next/image";

function smoothScroll(targetId: string) {
  const el = document.getElementById(targetId);
  if (!el) return;

  const start = window.scrollY;
  const end = el.getBoundingClientRect().top + start;
  const distance = end - start;
  const duration = 800;
  let startTime: number | null = null;

  // ease-in-out cubic
  function ease(t: number) {
    return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
  }

  function step(timestamp: number) {
    if (!startTime) startTime = timestamp;
    const elapsed = timestamp - startTime;
    const progress = Math.min(elapsed / duration, 1);
    window.scrollTo(0, start + distance * ease(progress));
    if (progress < 1) requestAnimationFrame(step);
  }

  requestAnimationFrame(step);
}

export default function Navbar() {
  function handleClick(e: React.MouseEvent<HTMLAnchorElement>) {
    const href = e.currentTarget.getAttribute("href");
    if (href?.startsWith("#")) {
      e.preventDefault();
      smoothScroll(href.slice(1));
    }
  }

  return (
    <nav className="flex items-center justify-between bg-charcoal text-white rounded-full pl-3 sm:pl-4 pr-3 py-3">
      <Image
        src="/logos/logo-dark-keyhole-wordmark.png"
        alt="dwelli"
        width={96}
        height={24}
      />
      <div className="hidden sm:flex items-center gap-8 text-sm">
        <a href="#residents" onClick={handleClick} className="text-white/80 hover:text-white">
          Residents
        </a>
        <a href="#owners" onClick={handleClick} className="text-white/80 hover:text-white">
          Owners
        </a>
        <a href="#faq" onClick={handleClick} className="text-white/80 hover:text-white">
          FAQ
        </a>
      </div>
      <div className="flex items-center gap-2">
        <a
          href="#signup"
          onClick={handleClick}
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
  );
}
