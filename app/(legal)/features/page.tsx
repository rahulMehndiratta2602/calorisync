import type { Metadata } from "next";
import Link from "next/link";
import {
  Camera,
  Mic,
  Type,
  Sparkles,
  Shield,
  Download,
  Smartphone,
  Zap,
  Heart,
  ChartLine,
  Lock,
  Globe,
} from "lucide-react";
import { landing } from "@/lib/landing-content";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Features",
  description:
    "Calorisync features — AI photo logging, voice meal entry, smart macro targets, web-first design.",
};

const HEADLINE_FEATURES = [
  {
    icon: Camera,
    title: "AI photo logging",
    body: "Point your camera at a plate. Claude identifies each item — protein, side, sauce — with portion estimates. Confidence scores tell you what to double-check.",
  },
  {
    icon: Mic,
    title: "Voice in one breath",
    body: "Tap the mic, describe your meal naturally. Browser-native speech-to-text means no extra app permissions, and parsing happens in seconds.",
  },
  {
    icon: Sparkles,
    title: "Smart macros that adapt",
    body: "We recompute targets when your weight or goal changes. Diet-style presets (keto, high-protein, Mediterranean) re-split kcal in one click.",
  },
];

const SECONDARY_FEATURES = [
  { icon: Type, title: "Type freeform", body: "Plain English in, structured log out. Edit confidence-low items inline." },
  { icon: ChartLine, title: "Daily + weekly views", body: "Macro progress, average kcal, trends across the week." },
  { icon: Download, title: "CSV export", body: "Take your data anywhere. We don't lock you in." },
  { icon: Smartphone, title: "Works on every screen", body: "Web-first means iPhone, Android, iPad, laptop — same experience." },
  { icon: Zap, title: "Under 5 seconds per meal", body: "From tap to logged in the time it takes to put down your fork." },
  { icon: Heart, title: "No dark patterns", body: "No ads. No streaks shaming. No upsell pop-ups. Just a quiet tracker." },
  { icon: Lock, title: "Your data, encrypted", body: "TLS in transit, encrypted at rest. Photos aren't used to train any AI model." },
  { icon: Globe, title: "Time-zone aware", body: "Days roll over in your local time, even when you travel." },
  { icon: Shield, title: "Cancel anytime", body: "Free tier preserves your full history. Drop down whenever." },
];

export default function FeaturesPage() {
  return (
    <article className="mx-auto max-w-4xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Features</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight sm:text-5xl">
          Everything you need to log meals in 4 seconds
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground sm:text-lg">
          Nothing you don't. Calorisync was built around three core inputs — photo, voice, text —
          and then we got out of the way.
        </p>
      </header>

      <section className="mt-16 flex flex-col gap-6">
        {HEADLINE_FEATURES.map((f) => {
          const Icon = f.icon;
          return (
            <Card key={f.title}>
              <CardContent className="grid gap-5 p-8 sm:grid-cols-[3rem_1fr] sm:items-start sm:gap-8">
                <div className="grid size-12 place-items-center rounded-2xl bg-primary/12 text-primary">
                  <Icon className="size-6" />
                </div>
                <div>
                  <h2 className="text-xl font-semibold tracking-tight">{f.title}</h2>
                  <p className="mt-2 text-pretty text-base text-muted-foreground">{f.body}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-16">
        <h2 className="text-center font-display text-2xl font-medium tracking-tight">
          And dozens of small things that add up
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {SECONDARY_FEATURES.map((f) => {
            const Icon = f.icon;
            return (
              <Card key={f.title} className="bg-card/60">
                <CardContent className="flex flex-col gap-2 p-5">
                  <Icon className="size-5 text-primary" />
                  <h3 className="text-base font-semibold">{f.title}</h3>
                  <p className="text-sm text-muted-foreground">{f.body}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

      <section className="mt-20 text-center">
        <h2 className="font-display text-2xl font-medium tracking-tight">Ready to try it?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          14-day free trial of Pro. No card required.
        </p>
        <div className="mt-6 flex justify-center gap-3">
          <Button asChild size="lg">
            <Link href="/signup">Start free</Link>
          </Button>
          <Button asChild size="lg" variant="outline">
            <Link href={`/?_=${landing.hero.cta_secondary}#features`}>See pricing</Link>
          </Button>
        </div>
      </section>
    </article>
  );
}
