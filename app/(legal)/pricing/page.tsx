import type { Metadata } from "next";
import Link from "next/link";
import { Check, Sparkles } from "lucide-react";
import { landing } from "@/lib/landing-content";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Pricing",
  description: "Simple pricing — $9/mo or $69/yr Pro, free tier forever, 14-day trial.",
};

export default function PricingPage() {
  const p = landing.pricing;
  return (
    <article className="mx-auto max-w-4xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">{p.eyebrow}</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          {p.headline}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          {p.description}
        </p>
      </header>

      <section className="mt-12 grid gap-6 sm:grid-cols-2">
        {p.plans.map((plan) => (
          <Card
            key={plan.name}
            className={cn(
              "relative flex flex-col gap-6 p-8",
              plan.highlighted
                ? "border-primary/60 ring-2 ring-primary/20 shadow-xl shadow-primary/10"
                : "bg-card/70",
            )}
          >
            {plan.badge && (
              <Badge className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1">
                <Sparkles className="size-3" />
                {plan.badge}
              </Badge>
            )}
            <div>
              <h2 className="text-lg font-semibold tracking-tight">{plan.name}</h2>
              <div className="mt-4 flex items-baseline gap-1">
                <span className="font-display text-5xl font-medium tracking-tight">
                  {plan.price}
                </span>
                <span className="text-base text-muted-foreground">{plan.period}</span>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">{plan.billed_as}</p>
            </div>
            <ul className="flex flex-col gap-2.5">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2.5 text-sm">
                  <Check className="mt-0.5 size-4 shrink-0 text-primary" />
                  <span>{f}</span>
                </li>
              ))}
            </ul>
            <Button
              asChild
              size="lg"
              variant={plan.highlighted ? "default" : "outline"}
              className="mt-2 w-full"
            >
              <Link href="/signup">{plan.cta}</Link>
            </Button>
          </Card>
        ))}
      </section>

      <section className="mt-12 grid max-w-3xl gap-4 sm:grid-cols-2 mx-auto">
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">
            Free forever
          </p>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{p.free_plan_note}</p>
        </div>
        <div className="rounded-2xl border border-dashed border-border bg-background/60 p-5">
          <p className="text-xs font-semibold uppercase tracking-wider text-primary">14-day trial</p>
          <p className="mt-2 text-sm text-pretty text-muted-foreground">{p.trial_note}</p>
        </div>
      </section>

      <section className="mt-16 rounded-2xl border border-border bg-card p-6 text-center sm:p-10">
        <h2 className="font-display text-2xl font-medium tracking-tight">
          Questions about pricing?
        </h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Read the FAQ or email us — we answer fast.
        </p>
        <div className="mt-5 flex justify-center gap-3">
          <Button asChild variant="outline" size="sm">
            <Link href="/#faq">See FAQ</Link>
          </Button>
          <Button asChild variant="outline" size="sm">
            <Link href="mailto:hello@calorisync.com">Email us</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
