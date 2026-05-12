import * as React from "react";
import { landing } from "@/lib/landing-content";
import { NewsletterForm } from "@/components/newsletter-form";

export function FinalCTASection() {
  const c = landing.final_cta;
  return (
    <section className="relative overflow-hidden py-28 sm:py-32">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-b from-background via-primary/5 to-background" />
        <div className="absolute left-1/2 top-1/2 h-[600px] w-[600px] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/10 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-3xl flex-col items-center px-5 text-center sm:px-8">
        <h2 className="max-w-2xl text-balance font-display text-[clamp(2rem,5vw,3.5rem)] font-medium leading-tight tracking-tight">
          {c.headline}
        </h2>
        <p className="mt-5 max-w-xl text-pretty text-base text-muted-foreground sm:text-lg">
          {c.subheadline}
        </p>
        <NewsletterForm source="landing-final-cta" cta={c.cta_primary} className="mt-8" />
        <p className="mt-4 text-xs text-muted-foreground">{c.microcopy}</p>
      </div>
    </section>
  );
}
