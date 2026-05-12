import type { Metadata } from "next";
import { Code, Lock, Workflow } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "API docs",
  description: "Calorisync API — coming for Pro users. Programmatic access to your meal log.",
};

export default function ApiDocsPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">API</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Coming for Pro users
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-pretty text-base text-muted-foreground">
          A read/write JSON API for your meals, macros, and profile. Ideal for syncing with
          spreadsheets, automation tools, or your own dashboard.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-3">
        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <Code className="size-5 text-primary" />
            <h2 className="text-base font-semibold">REST + JSON</h2>
            <p className="text-sm text-muted-foreground">
              Predictable endpoints, JSON-only request and response bodies.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <Lock className="size-5 text-primary" />
            <h2 className="text-base font-semibold">API keys</h2>
            <p className="text-sm text-muted-foreground">
              Per-user, scoped, revocable. Generate from your settings.
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="flex flex-col gap-2 p-5">
            <Workflow className="size-5 text-primary" />
            <h2 className="text-base font-semibold">Webhooks</h2>
            <p className="text-sm text-muted-foreground">
              Get notified when a meal is logged or a daily target is met.
            </p>
          </CardContent>
        </Card>
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/30 p-6 text-center text-sm text-muted-foreground">
        Want early access? Email{" "}
        <a href="mailto:hello@calorisync.com" className="text-primary underline-offset-2 hover:underline">
          hello@calorisync.com
        </a>{" "}
        and we'll loop you in.
      </section>
    </article>
  );
}
