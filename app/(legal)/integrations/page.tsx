import type { Metadata } from "next";
import { Calendar, Activity, Heart, FileSpreadsheet, Zap, Slack, Github } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const metadata: Metadata = {
  title: "Integrations",
  description: "What Calorisync connects to today and what's coming next.",
};

const INTEGRATIONS = [
  {
    icon: Heart,
    title: "Apple Health",
    body: "Two-way sync — weight, body composition, and active energy.",
    status: "soon" as const,
  },
  {
    icon: Activity,
    title: "Garmin Connect",
    body: "Pull workouts and calories burned to tune your target macros.",
    status: "soon" as const,
  },
  {
    icon: Activity,
    title: "Strava",
    body: "Auto-adjust daily kcal target after long runs and rides.",
    status: "soon" as const,
  },
  {
    icon: FileSpreadsheet,
    title: "Google Sheets",
    body: "Append a row per meal — keep your own backup or analysis sheet.",
    status: "soon" as const,
  },
  {
    icon: Calendar,
    title: "Google Calendar",
    body: "Block meal-prep time based on weekly macro patterns.",
    status: "later" as const,
  },
  {
    icon: Zap,
    title: "Zapier / Make",
    body: "Connect Calorisync to 5,000+ apps via our public webhooks.",
    status: "later" as const,
  },
  {
    icon: Slack,
    title: "Slack",
    body: "Daily macro summary in your channel of choice.",
    status: "later" as const,
  },
  {
    icon: Github,
    title: "CSV export",
    body: "Download every meal you've logged as CSV.",
    status: "live" as const,
  },
];

export default function IntegrationsPage() {
  return (
    <article className="mx-auto max-w-4xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Integrations</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Connect Calorisync to the rest of your stack
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-pretty text-base text-muted-foreground">
          Your data shouldn't be locked in. Here's what's already in the box and what's coming.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {INTEGRATIONS.map((it) => {
          const Icon = it.icon;
          const badgeVariant =
            it.status === "live" ? "success" : it.status === "soon" ? "default" : "outline";
          const label =
            it.status === "live" ? "Live" : it.status === "soon" ? "Coming soon" : "Roadmap";
          return (
            <Card key={it.title} className="bg-card/60">
              <CardContent className="flex flex-col gap-3 p-5">
                <div className="flex items-center justify-between">
                  <Icon className="size-5 text-primary" />
                  <Badge variant={badgeVariant} className="text-[10px]">
                    {label}
                  </Badge>
                </div>
                <h2 className="text-base font-semibold leading-snug">{it.title}</h2>
                <p className="text-sm text-muted-foreground">{it.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Want to integrate Calorisync with something not listed here? Email{" "}
        <a href="mailto:hello@calorisync.com" className="text-primary underline-offset-2 hover:underline">
          hello@calorisync.com
        </a>{" "}
        — we prioritize based on what people actually ask for.
      </section>
    </article>
  );
}
