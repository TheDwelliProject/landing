"use client";

import { useState } from "react";

const faqs = [
  {
    question: "What is Dwelli?",
    answer:
      "One app for everyone with a key to your building — rent, gate access, repairs, utilities.",
  },
  {
    question: "How do I list a property?",
    answer:
      "Sign up, add your building details, and invite your tenants and staff. Setup takes a few minutes.",
  },
  {
    question: "What does it cost?",
    answer:
      "Free for residents, always. Owners and managers pay \u20A62,500 per unit per month.",
  },
  {
    question: "When are you launching?",
    answer:
      "We\u2019re currently in private beta in Lagos. Sign up to get on the list.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="space-y-0">
      {faqs.map((faq, i) => {
        const isOpen = openIndex === i;
        return (
          <div key={i} className="border-t border-charcoal/10">
            <button
              onClick={() => setOpenIndex(isOpen ? null : i)}
              className="w-full flex items-center justify-between py-6 text-left cursor-pointer"
            >
              <span className="text-lg sm:text-xl font-medium">
                {faq.question}
              </span>
              <span
                className={`ml-4 shrink-0 w-8 h-8 rounded-full flex items-center justify-center transition-colors ${
                  isOpen
                    ? "bg-orange text-white"
                    : "bg-charcoal/5 text-charcoal/55"
                }`}
                aria-hidden="true"
              >
                {isOpen ? (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M2 2l8 8M10 2l-8 8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none">
                    <path
                      d="M6 2v8M2 6h8"
                      stroke="currentColor"
                      strokeWidth="1.6"
                      strokeLinecap="round"
                    />
                  </svg>
                )}
              </span>
            </button>
            <div className={`faq-content ${isOpen ? "open" : ""}`}>
              <div>
                <p className="pb-6 text-charcoal/70 max-w-xl">{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
      <div className="border-t border-charcoal/10" />
    </div>
  );
}
