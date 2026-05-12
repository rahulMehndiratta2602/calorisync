import * as React from "react";
import { landing } from "@/lib/landing-content";
import { Card } from "@/components/ui/card";

const SEED_GRADIENTS: Record<string, string> = {
  marathon: "from-emerald-500 to-teal-500",
  chef: "from-amber-500 to-orange-500",
  lifter: "from-fuchsia-500 to-rose-500",
  minimalist: "from-blue-500 to-sky-500",
};

function initials(name: string) {
  return name
    .split(" ")
    .map((p) => p[0])
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function TestimonialsSection() {
  return (
    <section className="py-24 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <p className="text-xs uppercase tracking-wider text-primary">Early testimonials</p>
          <h2 className="mt-3 font-display text-3xl font-medium tracking-tight sm:text-4xl">
            People who actually stuck with tracking
          </h2>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-2 lg:grid-cols-4">
          {landing.testimonials.map((t) => {
            const grad = SEED_GRADIENTS[t.avatar_seed] ?? "from-primary/70 to-primary";
            return (
              <Card key={t.name} className="flex flex-col gap-5 bg-card/70 p-6">
                <p className="text-pretty text-sm leading-relaxed">&ldquo;{t.quote}&rdquo;</p>
                <div className="mt-auto flex items-center gap-3">
                  <span
                    className={`grid size-10 place-items-center rounded-full bg-gradient-to-br ${grad} text-sm font-semibold text-white`}
                    aria-hidden
                  >
                    {initials(t.name)}
                  </span>
                  <div>
                    <p className="text-sm font-semibold leading-tight">{t.name}</p>
                    <p className="text-xs text-muted-foreground">{t.title}</p>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
}
