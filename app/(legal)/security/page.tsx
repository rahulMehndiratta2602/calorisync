import type { Metadata } from "next";
import { Lock, Database, Shield, FileKey, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Security",
  description:
    "How Calorisync protects your data — encryption, access controls, and responsible disclosure.",
};

const PRACTICES = [
  {
    icon: Lock,
    title: "TLS everywhere",
    body: "All traffic to calorisync.com is HTTPS-only, terminated at the edge by Cloudflare and re-encrypted to origin. We force HTTPS and set HSTS headers.",
  },
  {
    icon: Database,
    title: "Encrypted at rest",
    body: "Your data lives in a managed Postgres cluster (Neon) with disk-level encryption. Backups are encrypted. We never store passwords because we use magic-link auth.",
  },
  {
    icon: FileKey,
    title: "Minimal data collection",
    body: "We collect only what we need: email, profile fields you provide, and the meals you log. We don't track you across the web. No third-party trackers.",
  },
  {
    icon: Shield,
    title: "Strict access controls",
    body: "Production database access is restricted to a small set of engineers with audit logging. Application secrets are stored in protected env files, never committed.",
  },
];

export default function SecurityPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Security</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          How we keep your data safe
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Open beta status, transparent practices. Last updated May 2026.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        {PRACTICES.map((p) => {
          const Icon = p.icon;
          return (
            <Card key={p.title}>
              <CardContent className="flex flex-col gap-3 p-5">
                <Icon className="size-5 text-primary" />
                <h2 className="text-base font-semibold">{p.title}</h2>
                <p className="text-sm text-muted-foreground">{p.body}</p>
              </CardContent>
            </Card>
          );
        })}
      </section>

      <section className="mt-12">
        <h2 className="font-display text-2xl font-medium tracking-tight">Responsible disclosure</h2>
        <p className="mt-3 text-sm text-muted-foreground">
          Found a vulnerability? Email{" "}
          <a href="mailto:security@calorisync.com" className="text-primary underline-offset-2 hover:underline">
            security@calorisync.com
          </a>{" "}
          with details. We commit to acknowledging your report within 48 hours and working with
          you on a fix. We don't have a bug bounty program yet, but we will publicly credit
          researchers who disclose responsibly.
        </p>
      </section>

      <section className="mt-12 rounded-2xl border border-amber-500/30 bg-amber-500/8 p-5 text-sm text-amber-700 dark:text-amber-200">
        <p className="font-semibold inline-flex items-center gap-2">
          <AlertTriangle className="size-4" />
          Beta caveat
        </p>
        <p className="mt-2 text-amber-700/90 dark:text-amber-200/90">
          We're in open beta. We follow industry-standard practices but haven't completed SOC 2 or
          ISO 27001 audits yet. If you're handling protected health data or are otherwise subject
          to specific compliance requirements, please contact us before signing up.
        </p>
      </section>
    </article>
  );
}
