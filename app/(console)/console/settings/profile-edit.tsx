"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Edit3, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const GOALS = [
  { value: "lose", label: "Lose fat" },
  { value: "maintain", label: "Maintain" },
  { value: "gain", label: "Gain muscle" },
  { value: "recomp", label: "Recomp" },
];
const ACTIVITY = [
  { value: "sedentary", label: "Sedentary" },
  { value: "light", label: "Light" },
  { value: "moderate", label: "Moderate" },
  { value: "active", label: "Active" },
  { value: "very_active", label: "Very active" },
];
const DIETS = [
  { value: "balanced", label: "Balanced" },
  { value: "high_protein", label: "High-protein" },
  { value: "keto", label: "Keto" },
  { value: "mediterranean", label: "Mediterranean" },
  { value: "vegan", label: "Vegan" },
  { value: "vegetarian", label: "Vegetarian" },
];

interface ProfileEditProps {
  initial: {
    name?: string | null;
    weightKg?: string | null;
    heightCm?: string | null;
    dob?: string | null;
    sex?: string | null;
    activityLevel?: string | null;
    goal?: string | null;
    dietStyle?: string | null;
    timezone?: string | null;
  };
}

export function ProfileEdit({ initial }: ProfileEditProps) {
  const router = useRouter();
  const [editing, setEditing] = React.useState(false);
  const [saving, setSaving] = React.useState(false);
  const [form, setForm] = React.useState({
    weightKg: initial.weightKg ? String(initial.weightKg) : "",
    heightCm: initial.heightCm ? String(initial.heightCm) : "",
    dob: initial.dob || "",
    sex: initial.sex || "other",
    activityLevel: initial.activityLevel || "moderate",
    goal: initial.goal || "maintain",
    dietStyle: initial.dietStyle || "balanced",
  });

  async function onSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/profile/update", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(form),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't save.");
        return;
      }
      toast.success(
        json.targets
          ? `Updated. New target: ${json.targets.kcal} kcal/day.`
          : "Profile updated.",
      );
      setEditing(false);
      router.refresh();
    } catch {
      toast.error("Network error.");
    } finally {
      setSaving(false);
    }
  }

  if (!editing) {
    return (
      <Button size="sm" variant="outline" onClick={() => setEditing(true)}>
        <Edit3 className="size-3.5" /> Edit profile
      </Button>
    );
  }

  return (
    <div className="flex flex-col gap-4 rounded-2xl border border-border bg-muted/20 p-4">
      <div className="grid grid-cols-2 gap-3">
        <Field label="Weight (kg)">
          <Input
            type="number"
            inputMode="decimal"
            value={form.weightKg}
            onChange={(e) => setForm((f) => ({ ...f, weightKg: e.target.value }))}
          />
        </Field>
        <Field label="Height (cm)">
          <Input
            type="number"
            inputMode="decimal"
            value={form.heightCm}
            onChange={(e) => setForm((f) => ({ ...f, heightCm: e.target.value }))}
          />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="DOB">
          <Input
            type="date"
            value={form.dob}
            onChange={(e) => setForm((f) => ({ ...f, dob: e.target.value }))}
          />
        </Field>
        <Field label="Sex">
          <select
            className="h-11 w-full rounded-xl border border-input bg-background px-3 text-sm"
            value={form.sex}
            onChange={(e) => setForm((f) => ({ ...f, sex: e.target.value }))}
          >
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>
      <Field label="Activity level">
        <div className="grid grid-cols-5 gap-1.5">
          {ACTIVITY.map((a) => (
            <button
              key={a.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, activityLevel: a.value }))}
              className={cn(
                "rounded-xl border px-2 py-1.5 text-xs transition-colors",
                form.activityLevel === a.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {a.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Goal">
        <div className="grid grid-cols-4 gap-1.5">
          {GOALS.map((g) => (
            <button
              key={g.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, goal: g.value }))}
              className={cn(
                "rounded-xl border px-2 py-1.5 text-xs transition-colors",
                form.goal === g.value
                  ? "border-primary bg-primary text-primary-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {g.label}
            </button>
          ))}
        </div>
      </Field>
      <Field label="Diet style">
        <div className="grid grid-cols-3 gap-1.5">
          {DIETS.map((d) => (
            <button
              key={d.value}
              type="button"
              onClick={() => setForm((f) => ({ ...f, dietStyle: d.value }))}
              className={cn(
                "rounded-xl border px-2 py-1.5 text-xs transition-colors",
                form.dietStyle === d.value
                  ? "border-primary bg-primary/15 text-foreground"
                  : "border-border text-muted-foreground hover:text-foreground",
              )}
            >
              {d.label}
            </button>
          ))}
        </div>
      </Field>

      <div className="flex justify-end gap-2 pt-1">
        <Button variant="ghost" size="sm" onClick={() => setEditing(false)} disabled={saving}>
          <X className="size-3.5" /> Cancel
        </Button>
        <Button size="sm" onClick={onSave} disabled={saving}>
          <Save className="size-3.5" /> {saving ? "Saving..." : "Save"}
        </Button>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-col gap-1.5">
      <Label className="text-xs uppercase tracking-wider text-muted-foreground">{label}</Label>
      {children}
    </div>
  );
}
