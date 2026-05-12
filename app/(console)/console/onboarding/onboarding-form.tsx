"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { ArrowRight, Sparkles } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose", label: "Lose fat" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain muscle" },
  { value: "recomp", label: "Recomp" },
];

const ACTIVITY = [
  { value: "sedentary", label: "Sedentary", note: "Desk job, little movement" },
  { value: "light", label: "Light", note: "1–2 sessions / week" },
  { value: "moderate", label: "Moderate", note: "3–5 sessions / week" },
  { value: "active", label: "Active", note: "6+ sessions / week" },
  { value: "very_active", label: "Very active", note: "Daily training + active job" },
];

const DIET_STYLE = [
  { value: "balanced", label: "Balanced" },
  { value: "high_protein", label: "High-protein" },
  { value: "keto", label: "Keto" },
  { value: "mediterranean", label: "Mediterranean" },
];

const SEX = [
  { value: "female", label: "Female" },
  { value: "male", label: "Male" },
  { value: "other", label: "Other" },
];

export function OnboardingForm({ userEmail }: { userEmail: string }) {
  const router = useRouter();
  const [step, setStep] = React.useState(1);
  const [submitting, setSubmitting] = React.useState(false);
  const [data, setData] = React.useState({
    name: "",
    sex: "female" as "female" | "male" | "other",
    dob: "",
    heightCm: "",
    weightKg: "",
    activityLevel: "moderate" as (typeof ACTIVITY)[number]["value"],
    goal: "maintain" as (typeof GOALS)[number]["value"],
    dietStyle: "balanced" as (typeof DIET_STYLE)[number]["value"],
    timezone: typeof Intl !== "undefined" ? Intl.DateTimeFormat().resolvedOptions().timeZone : "UTC",
    marketingOptIn: false,
  });

  function update<K extends keyof typeof data>(k: K, v: (typeof data)[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }

  async function submit() {
    setSubmitting(true);
    try {
      const res = await fetch("/api/profile/onboard", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(data),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't save your profile.");
        return;
      }
      router.push("/console");
    } catch {
      toast.error("Network error. Try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-xl">
      <header className="mb-8 text-center">
        <Sparkles className="mx-auto size-8 text-primary" />
        <h1 className="mt-4 font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Welcome to Calorisync
        </h1>
        <p className="mt-2 text-pretty text-sm text-muted-foreground">
          Quick setup so we can personalize your macros. About 60 seconds.
        </p>
      </header>

      <div className="mb-6 flex items-center justify-center gap-2">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className={cn(
              "h-1.5 w-10 rounded-full transition-colors",
              n <= step ? "bg-primary" : "bg-muted",
            )}
          />
        ))}
      </div>

      <Card>
        <CardContent className="p-6 sm:p-8">
          {step === 1 && (
            <Step title="The basics" subtitle="Used for accurate calorie targets.">
              <div className="flex flex-col gap-1.5">
                <Label htmlFor="name">Name (optional)</Label>
                <Input
                  id="name"
                  placeholder="Your name"
                  value={data.name}
                  onChange={(e) => update("name", e.target.value)}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Sex">
                  <SegControl
                    options={SEX}
                    value={data.sex}
                    onChange={(v) => update("sex", v as typeof data.sex)}
                  />
                </Field>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="dob">Date of birth</Label>
                  <Input
                    id="dob"
                    type="date"
                    value={data.dob}
                    onChange={(e) => update("dob", e.target.value)}
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="height">Height (cm)</Label>
                  <Input
                    id="height"
                    type="number"
                    inputMode="decimal"
                    placeholder="170"
                    value={data.heightCm}
                    onChange={(e) => update("heightCm", e.target.value)}
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <Label htmlFor="weight">Weight (kg)</Label>
                  <Input
                    id="weight"
                    type="number"
                    inputMode="decimal"
                    placeholder="68"
                    value={data.weightKg}
                    onChange={(e) => update("weightKg", e.target.value)}
                  />
                </div>
              </div>
            </Step>
          )}

          {step === 2 && (
            <Step title="Activity level" subtitle="Roughly how much you move in a typical week.">
              <div className="flex flex-col gap-2">
                {ACTIVITY.map((a) => (
                  <button
                    key={a.value}
                    type="button"
                    className={cn(
                      "flex items-center justify-between rounded-xl border px-4 py-3 text-left transition-colors",
                      data.activityLevel === a.value
                        ? "border-primary bg-primary/8"
                        : "border-border hover:bg-muted/40",
                    )}
                    onClick={() => update("activityLevel", a.value as typeof data.activityLevel)}
                  >
                    <div>
                      <p className="text-sm font-medium">{a.label}</p>
                      <p className="text-xs text-muted-foreground">{a.note}</p>
                    </div>
                    {data.activityLevel === a.value && (
                      <span className="size-2 rounded-full bg-primary" />
                    )}
                  </button>
                ))}
              </div>
            </Step>
          )}

          {step === 3 && (
            <Step title="Your goal" subtitle="We'll tune macros around your direction.">
              <div className="grid grid-cols-2 gap-2">
                {GOALS.map((g) => (
                  <button
                    key={g.value}
                    type="button"
                    className={cn(
                      "rounded-xl border px-3 py-3 text-sm font-medium transition-colors",
                      data.goal === g.value
                        ? "border-primary bg-primary text-primary-foreground"
                        : "border-border hover:bg-muted/40",
                    )}
                    onClick={() => update("goal", g.value as typeof data.goal)}
                  >
                    {g.label}
                  </button>
                ))}
              </div>
              <Field label="Diet style">
                <div className="grid grid-cols-2 gap-2">
                  {DIET_STYLE.map((d) => (
                    <button
                      key={d.value}
                      type="button"
                      className={cn(
                        "rounded-xl border px-3 py-2.5 text-sm transition-colors",
                        data.dietStyle === d.value
                          ? "border-primary bg-primary/10 text-foreground"
                          : "border-border text-muted-foreground hover:text-foreground",
                      )}
                      onClick={() => update("dietStyle", d.value as typeof data.dietStyle)}
                    >
                      {d.label}
                    </button>
                  ))}
                </div>
              </Field>
            </Step>
          )}

          {step === 4 && (
            <Step title="One last thing" subtitle="Time zone helps us roll over days correctly.">
              <div className="flex flex-col gap-1.5">
                <Label>Time zone</Label>
                <div className="rounded-xl border border-border bg-muted/30 px-4 py-3 text-sm">
                  {data.timezone}
                </div>
                <p className="text-xs text-muted-foreground">
                  Auto-detected from your browser. You can change this in settings later.
                </p>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-border p-4 cursor-pointer hover:bg-muted/30">
                <input
                  type="checkbox"
                  className="mt-0.5 size-4 accent-primary"
                  checked={data.marketingOptIn}
                  onChange={(e) => update("marketingOptIn", e.target.checked)}
                />
                <div>
                  <p className="text-sm font-medium">Send me the weekly newsletter</p>
                  <p className="text-xs text-muted-foreground">
                    One Saturday email with macro tips and product updates. Unsubscribe anytime.
                  </p>
                </div>
              </label>
            </Step>
          )}

          <div className="mt-8 flex items-center justify-between">
            <Button
              type="button"
              variant="ghost"
              disabled={step === 1 || submitting}
              onClick={() => setStep((s) => Math.max(1, s - 1))}
            >
              Back
            </Button>
            {step < 4 ? (
              <Button type="button" onClick={() => setStep((s) => s + 1)} disabled={submitting}>
                Continue
                <ArrowRight className="size-4" />
              </Button>
            ) : (
              <Button type="button" onClick={submit} disabled={submitting}>
                {submitting ? "Saving..." : "Finish setup"}
                <ArrowRight className="size-4" />
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        Signed in as <span className="font-medium text-foreground">{userEmail}</span>
      </p>
    </div>
  );
}

function Step({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <div className="flex flex-col gap-5">
      <header>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p>
      </header>
      <div className="flex flex-col gap-4">{children}</div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label>{label}</Label>
      {children}
    </div>
  );
}

function SegControl({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
}) {
  return (
    <div className="inline-flex w-full rounded-xl border border-border bg-muted/30 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          className={cn(
            "flex-1 rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
            value === o.value
              ? "bg-background text-foreground shadow-sm"
              : "text-muted-foreground hover:text-foreground",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}
