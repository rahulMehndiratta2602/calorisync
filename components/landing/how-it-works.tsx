import * as React from "react";
import { landing } from "@/lib/landing-content";

export function HowItWorksSection() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto w-full max-w-5xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wider text-primary">How it works</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            From plate to log in 4 seconds
          </h2>
          <p className="mt-3 text-base text-muted-foreground">
            Three steps. The first is the only one that takes effort.
          </p>
        </div>

        <ol className="mt-14 grid gap-6 sm:grid-cols-3 sm:gap-8">
          {landing.how_it_works.map((step) => (
            <li
              key={step.step_number}
              className="relative flex flex-col gap-3 rounded-2xl border border-border bg-card p-6 transition-colors hover:bg-muted/30"
            >
              <span className="inline-flex size-10 items-center justify-center rounded-full bg-primary/12 font-display text-lg font-medium text-primary">
                {String(step.step_number).padStart(2, "0")}
              </span>
              <h3 className="text-lg font-semibold tracking-tight">{step.title}</h3>
              <p className="text-pretty text-sm leading-relaxed text-muted-foreground">
                {step.description}
              </p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
