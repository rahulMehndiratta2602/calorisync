"use client";

import * as React from "react";
import { motion, useInView } from "motion/react";
import { Camera, Mic, SlidersHorizontal, Check } from "lucide-react";
import { landing } from "@/lib/landing-content";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

const VISUALS = [PhotoVisual, VoiceVisual, MacrosVisual];

export function FeatureDeepDivesSection() {
  return (
    <section id="features" className="relative py-24 sm:py-28">
      <div className="mx-auto w-full max-w-6xl px-5 sm:px-8">
        <div className="flex flex-col gap-28">
          {landing.feature_deep_dives.map((feature, idx) => {
            const Visual = VISUALS[idx] ?? PhotoVisual;
            const reverse = idx % 2 === 1;
            return (
              <FeatureRow
                key={feature.title}
                feature={feature}
                visual={<Visual />}
                reverse={reverse}
                idx={idx}
              />
            );
          })}
        </div>
      </div>
    </section>
  );
}

function FeatureRow({
  feature,
  visual,
  reverse,
  idx,
}: {
  feature: (typeof landing.feature_deep_dives)[number];
  visual: React.ReactNode;
  reverse: boolean;
  idx: number;
}) {
  const ref = React.useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: "-80px" });

  return (
    <div
      ref={ref}
      className={`grid items-center gap-10 lg:grid-cols-2 lg:gap-20 ${
        reverse ? "lg:[direction:rtl]" : ""
      }`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.5, delay: 0.05 }}
        className="lg:[direction:ltr]"
      >
        <Badge variant="soft" className="mb-4 text-[11px] uppercase tracking-wider">
          {feature.eyebrow}
        </Badge>
        <h2 className="text-balance font-display text-3xl font-medium leading-tight tracking-tight sm:text-4xl lg:text-[2.625rem]">
          {feature.title}
        </h2>
        <p className="mt-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
          {feature.description}
        </p>
        <ul className="mt-6 flex flex-col gap-3">
          {feature.bullet_points.map((p) => (
            <li key={p} className="flex items-start gap-3 text-sm">
              <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-primary/15 text-primary">
                <Check className="size-3" />
              </span>
              <span>{p}</span>
            </li>
          ))}
        </ul>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={inView ? { opacity: 1, y: 0 } : {}}
        transition={{ duration: 0.6, delay: 0.1 }}
        className="relative lg:[direction:ltr]"
      >
        <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-xl shadow-primary/5 ring-1 ring-foreground/5">
          {visual}
        </div>
      </motion.div>
    </div>
  );
}

// ─── Visuals ───

function PhotoVisual() {
  const items = [
    { name: "Grilled salmon", grams: 142, kcal: 248, conf: 0.94 },
    { name: "Roasted asparagus", grams: 86, kcal: 18, conf: 0.91 },
    { name: "Quinoa", grams: 95, kcal: 117, conf: 0.86 },
    { name: "Lemon wedge", grams: 8, kcal: 2, conf: 0.78 },
  ];
  return (
    <div className="grid grid-rows-[200px_auto] sm:grid-rows-[260px_auto]">
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-900/30 via-emerald-700/15 to-amber-700/25">
        <div className="absolute inset-0 grid place-items-center">
          <div className="grid h-3/4 w-3/4 grid-cols-6 grid-rows-4 gap-1 opacity-40">
            <div className="col-span-3 row-span-3 rounded-2xl bg-rose-400/70" />
            <div className="col-span-3 row-span-2 rounded-2xl bg-emerald-500/70" />
            <div className="col-span-2 row-span-2 rounded-2xl bg-amber-300/70" />
            <div className="col-span-1 row-span-1 rounded-full bg-yellow-300/80" />
          </div>
        </div>
        <div className="absolute left-4 top-4 inline-flex items-center gap-2 rounded-full bg-foreground/80 px-3 py-1 text-[11px] font-medium text-background backdrop-blur">
          <Camera className="size-3" />
          Photo upload
        </div>
      </div>
      <div className="border-t border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AI detected</p>
        <ul className="mt-3 flex flex-col gap-2">
          {items.map((it) => (
            <li
              key={it.name}
              className="flex items-center justify-between rounded-xl border border-border/60 bg-background px-3 py-2"
            >
              <div className="flex items-center gap-2.5">
                <span
                  className={`inline-flex h-5 min-w-9 items-center justify-center rounded-full px-1.5 text-[10px] font-semibold ${
                    it.conf >= 0.85
                      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                      : "bg-amber-500/15 text-amber-600 dark:text-amber-400"
                  }`}
                >
                  {Math.round(it.conf * 100)}%
                </span>
                <span className="text-sm font-medium">{it.name}</span>
                <span className="text-xs text-muted-foreground">{it.grams}g</span>
              </div>
              <span className="text-sm font-semibold tabular-nums">{it.kcal} kcal</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

function VoiceVisual() {
  return (
    <div className="relative grid grid-rows-[1fr_auto] bg-gradient-to-br from-background via-background to-muted/30 min-h-[400px]">
      <div className="flex flex-col items-center justify-center gap-6 p-8">
        <div className="relative">
          <div className="absolute inset-0 animate-ping rounded-full bg-primary/30" />
          <div className="relative grid size-20 place-items-center rounded-full bg-primary text-primary-foreground shadow-lg shadow-primary/25">
            <Mic className="size-8" />
          </div>
        </div>
        <p className="text-center text-sm font-medium text-muted-foreground">Listening...</p>
        <div className="flex items-end justify-center gap-1">
          {[16, 28, 22, 36, 20, 32, 14].map((h, i) => (
            <span
              key={i}
              className="w-1.5 animate-pulse rounded-full bg-primary"
              style={{ height: h, animationDelay: `${i * 90}ms` }}
            />
          ))}
        </div>
      </div>
      <div className="border-t border-border bg-card p-5">
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Transcript</p>
        <p className="mt-2 text-sm leading-relaxed">
          “Two slices of sourdough with avocado and a shot of espresso.”
        </p>
        <div className="mt-3 inline-flex items-center gap-2 rounded-full bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
          <span className="size-1.5 rounded-full bg-primary" />
          Logged in 4.2s — 412 kcal
        </div>
      </div>
    </div>
  );
}

function MacrosVisual() {
  const macros = [
    { label: "Protein", value: 118, target: 130, color: "from-chart-1/40 to-chart-1" },
    { label: "Carbs", value: 168, target: 220, color: "from-chart-3/40 to-chart-3" },
    { label: "Fat", value: 62, target: 75, color: "from-chart-4/40 to-chart-4" },
  ];
  return (
    <div className="p-6 sm:p-8">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-wider text-muted-foreground">Diet style</p>
          <p className="mt-1 text-sm font-semibold">High-protein</p>
        </div>
        <SlidersHorizontal className="size-4 text-muted-foreground" />
      </div>

      <div className="mt-6 flex items-center gap-1.5">
        {["Balanced", "Keto", "High-protein", "Med."].map((s, i) => (
          <span
            key={s}
            className={`rounded-full border px-3 py-1 text-[11px] font-medium ${
              i === 2
                ? "border-primary bg-primary text-primary-foreground"
                : "border-border text-muted-foreground"
            }`}
          >
            {s}
          </span>
        ))}
      </div>

      <div className="mt-8 flex flex-col gap-5">
        {macros.map((m) => {
          const pct = Math.min(100, Math.round((m.value / m.target) * 100));
          return (
            <div key={m.label}>
              <div className="mb-1.5 flex items-center justify-between text-sm">
                <span className="font-medium">{m.label}</span>
                <span className="tabular-nums text-muted-foreground">
                  <span className="text-foreground font-semibold">{m.value}</span> / {m.target}g
                </span>
              </div>
              <Progress value={pct} indicatorClassName={`bg-gradient-to-r ${m.color}`} />
            </div>
          );
        })}
      </div>

      <div className="mt-6 grid grid-cols-3 gap-3 rounded-2xl border border-border bg-muted/30 p-3 text-center">
        <Stat label="BMR" value="1,652" />
        <Stat label="TDEE" value="2,560" />
        <Stat label="Target" value="2,200" />
      </div>
    </div>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-semibold tabular-nums">{value}</p>
    </div>
  );
}
