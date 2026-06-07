"use client";

import * as React from "react";
import Link from "next/link";
import { motion } from "motion/react";
import { Sparkles, Play, Check } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { NewsletterForm } from "@/components/newsletter-form";
import { landing } from "@/lib/landing-content";

export function HeroSection() {
  const h = landing.hero;
  const reduceMotion = typeof window !== "undefined" && window.matchMedia
    ? window.matchMedia("(prefers-reduced-motion: reduce)").matches
    : false;

  return (
    <section className="relative isolate overflow-hidden">
      {/* Background flourishes */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-fade" />
        <div className="absolute inset-x-0 top-0 h-[600px] bg-grid mask-fade-b opacity-[0.55]" />
        <div className="absolute -left-32 top-32 h-[420px] w-[420px] rounded-full bg-primary/15 blur-3xl" />
        <div className="absolute -right-32 top-60 h-[380px] w-[380px] rounded-full bg-chart-2/12 blur-3xl" />
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col items-center px-5 pt-16 pb-20 text-center sm:px-8 sm:pt-24 sm:pb-28 lg:pt-28">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55 }}
        >
          <Badge variant="default" className="gap-1.5 px-3 py-1 text-xs">
            <Sparkles className="size-3" />
            {h.badge}
          </Badge>
        </motion.div>

        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, delay: 0.05 }}
          className="mt-6 max-w-3xl text-balance font-display text-[clamp(2.5rem,6vw,4.75rem)] font-medium leading-[1.02] tracking-tight text-foreground"
        >
          {h.headline}
        </motion.h1>

        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.55, delay: 0.12 }}
          className="mt-5 max-w-xl text-pretty text-lg leading-relaxed text-muted-foreground sm:text-xl"
        >
          {h.subheadline}
        </motion.p>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="mt-8 flex w-full flex-col items-center gap-3"
        >
          <NewsletterForm source="landing-hero" cta={h.cta_primary} className="mx-auto" />
          <div className="flex flex-wrap items-center justify-center gap-x-5 gap-y-1.5 text-xs text-muted-foreground">
            {h.trust_signals.map((t) => (
              <span key={t} className="inline-flex items-center gap-1.5">
                <Check className="size-3.5 text-primary" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={reduceMotion ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.35 }}
          className="mt-12 flex flex-wrap items-center justify-center gap-3"
        >
          <Button variant="outline" size="sm" asChild>
            <Link href="/demo" className="gap-1.5">
              <Play className="size-3.5 fill-current" />
              Try the demo
            </Link>
          </Button>
        </motion.div>

        {/* Mock product preview */}
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 32, scale: 0.96 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 0.75, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="relative mt-16 w-full max-w-5xl"
        >
          <div className="relative rounded-3xl border border-border bg-card shadow-2xl shadow-primary/5 ring-1 ring-foreground/5">
            <ProductPreview />
          </div>
        </motion.div>
      </div>
    </section>
  );
}

function ProductPreview() {
  return (
    <div className="relative aspect-[16/9] overflow-hidden rounded-3xl bg-gradient-to-br from-background via-background to-muted/40">
      {/* Window chrome */}
      <div className="absolute inset-x-0 top-0 flex h-9 items-center gap-2 border-b border-border/60 bg-background/80 px-4 backdrop-blur">
        <span className="size-2.5 rounded-full bg-red-400/70" />
        <span className="size-2.5 rounded-full bg-amber-400/70" />
        <span className="size-2.5 rounded-full bg-emerald-400/70" />
        <span className="ml-3 hidden text-xs text-muted-foreground sm:inline">calorisync.com/today</span>
      </div>

      <div className="absolute inset-0 top-9 grid grid-cols-1 gap-4 p-5 sm:grid-cols-[1fr_1.4fr] sm:p-8">
        {/* LEFT — Today's totals */}
        <div className="flex flex-col gap-4">
          <div className="rounded-2xl border border-border bg-card p-5">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Today</p>
            <p className="mt-1 font-display text-3xl font-medium tracking-tight">1,847 kcal</p>
            <p className="mt-0.5 text-xs text-muted-foreground">of 2,200 target</p>
            <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full w-[84%] rounded-full bg-primary" />
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2">
            {[
              { label: "Protein", value: "118g", pct: "94%", color: "bg-chart-1" },
              { label: "Carbs", value: "168g", pct: "76%", color: "bg-chart-3" },
              { label: "Fat", value: "62g", pct: "82%", color: "bg-chart-4" },
            ].map((m) => (
              <div key={m.label} className="rounded-xl border border-border bg-card p-3">
                <p className="text-[10px] uppercase tracking-wider text-muted-foreground">
                  {m.label}
                </p>
                <p className="mt-1 text-sm font-semibold">{m.value}</p>
                <p className="text-[10px] text-muted-foreground">{m.pct}</p>
              </div>
            ))}
          </div>
        </div>

        {/* RIGHT — Recent meals */}
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">Recent meals</p>
            <span className="text-[10px] text-primary">+ Log</span>
          </div>
          {[
            { name: "Greek yogurt bowl", time: "8:42 AM", kcal: 320, source: "📸 Photo" },
            { name: "Chicken & quinoa", time: "1:15 PM", kcal: 620, source: "🎙 Voice" },
            { name: "Almonds (handful)", time: "4:00 PM", kcal: 165, source: "Typed" },
            { name: "Salmon & sweet potato", time: "7:30 PM", kcal: 742, source: "📸 Photo" },
          ].map((m) => (
            <div
              key={m.name}
              className="flex items-center justify-between rounded-xl border border-border bg-card px-3.5 py-2.5"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium">{m.name}</p>
                <p className="text-[11px] text-muted-foreground">
                  {m.time} · {m.source}
                </p>
              </div>
              <p className="ml-3 text-sm font-semibold tabular-nums">{m.kcal} kcal</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
