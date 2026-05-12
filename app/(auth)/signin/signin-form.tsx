"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, Mail, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

const ERROR_MESSAGES: Record<string, string> = {
  missing_token: "That sign-in link was incomplete. Try requesting another.",
  not_found: "That link wasn't recognized. It may have already been used.",
  already_used: "That link has already been used. Request another below.",
  expired: "That sign-in link expired. We'll send you a fresh one.",
  invalid_token: "That link is invalid. Try again below.",
};

export function SigninForm({
  errorPromise,
}: {
  errorPromise?: Promise<{ error?: string }>;
}) {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [sent, setSent] = React.useState(false);
  const [errorMsg, setErrorMsg] = React.useState<string | null>(null);

  React.useEffect(() => {
    if (!errorPromise) return;
    errorPromise.then((p) => {
      if (p.error && ERROR_MESSAGES[p.error]) {
        setErrorMsg(ERROR_MESSAGES[p.error]);
      }
    });
  }, [errorPromise]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("That email doesn't look right.");
      return;
    }
    setSubmitting(true);
    setErrorMsg(null);
    try {
      const res = await fetch("/api/auth/signin", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ email }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't send the link.");
        return;
      }
      setSent(true);
    } catch {
      toast.error("Network error. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (sent) {
    return (
      <div className="rounded-3xl border border-border bg-card p-8 text-center shadow-sm">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <CheckCircle2 className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-medium tracking-tight">
          Check your inbox
        </h1>
        <p className="mt-3 text-pretty text-sm text-muted-foreground">
          We sent a sign-in link to <span className="font-medium text-foreground">{email}</span>.
          The link expires in 30 minutes.
        </p>
        <button
          type="button"
          className="mt-6 text-xs text-muted-foreground underline-offset-2 hover:text-foreground hover:underline"
          onClick={() => {
            setSent(false);
            setEmail("");
          }}
        >
          Use a different email
        </button>
      </div>
    );
  }

  return (
    <div className="rounded-3xl border border-border bg-card p-8 shadow-sm">
      <div className="text-center">
        <div className="mx-auto grid size-12 place-items-center rounded-full bg-primary/15 text-primary">
          <Mail className="size-6" />
        </div>
        <h1 className="mt-5 font-display text-2xl font-medium tracking-tight">
          Sign in to Calorisync
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          We'll send a one-time magic link. No password to remember.
        </p>
      </div>

      {errorMsg && (
        <div
          className="mt-6 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive"
          role="alert"
        >
          {errorMsg}
        </div>
      )}

      <form onSubmit={onSubmit} className="mt-6 flex flex-col gap-4">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="email"
            required
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="h-12"
          />
        </div>
        <Button type="submit" size="lg" disabled={submitting} className="h-12 w-full">
          {submitting ? "Sending link..." : "Send magic link"}
          {!submitting && <ArrowRight className="size-4" />}
        </Button>
      </form>

      <p className="mt-6 text-center text-xs text-muted-foreground">
        By signing in you agree to our{" "}
        <a href="/terms" className="underline-offset-2 hover:text-foreground hover:underline">
          terms
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline-offset-2 hover:text-foreground hover:underline">
          privacy policy
        </a>
        .
      </p>
    </div>
  );
}
