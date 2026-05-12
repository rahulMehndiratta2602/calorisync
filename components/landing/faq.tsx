"use client";

import * as React from "react";
import { ChevronDown } from "lucide-react";
import { landing } from "@/lib/landing-content";
import { cn } from "@/lib/utils";

export function FAQSection() {
  const [open, setOpen] = React.useState<number | null>(0);

  return (
    <section id="faq" className="border-y border-border/60 bg-muted/20 py-24 sm:py-28">
      <div className="mx-auto w-full max-w-3xl px-5 sm:px-8">
        <div className="text-center">
          <p className="text-xs uppercase tracking-wider text-primary">FAQ</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Answers to what people ask first
          </h2>
        </div>

        <ul className="mt-12 flex flex-col gap-2">
          {landing.faq.map((q, i) => {
            const isOpen = open === i;
            return (
              <li
                key={q.question}
                className={cn(
                  "overflow-hidden rounded-2xl border border-border bg-background transition-colors",
                  isOpen && "bg-card shadow-sm",
                )}
              >
                <button
                  type="button"
                  className="flex w-full items-start justify-between gap-4 px-5 py-4 text-left"
                  onClick={() => setOpen(isOpen ? null : i)}
                  aria-expanded={isOpen}
                >
                  <span className="text-base font-medium leading-snug">{q.question}</span>
                  <ChevronDown
                    className={cn(
                      "mt-0.5 size-5 shrink-0 text-muted-foreground transition-transform",
                      isOpen && "rotate-180 text-foreground",
                    )}
                  />
                </button>
                <div
                  className={cn(
                    "grid transition-all duration-300 ease-out",
                    isOpen ? "grid-rows-[1fr] opacity-100" : "grid-rows-[0fr] opacity-0",
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="px-5 pb-5 text-sm leading-relaxed text-muted-foreground">
                      {q.answer}
                    </p>
                  </div>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
