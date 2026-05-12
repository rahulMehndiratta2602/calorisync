"use client";

import * as React from "react";
import { toast } from "sonner";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

export interface NewsletterFormProps {
  source: string;
  className?: string;
  placeholder?: string;
  cta?: string;
  variant?: "inline" | "stacked";
}

export function NewsletterForm({
  source,
  className,
  placeholder = "you@example.com",
  cta = "Get early access",
  variant = "inline",
}: NewsletterFormProps) {
  const [email, setEmail] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);
  const [done, setDone] = React.useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || !email.includes("@")) {
      toast.error("That email doesn't look right.");
      return;
    }
    setSubmitting(true);
    try {
      const res = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          email,
          source,
          referrer: typeof document !== "undefined" ? document.referrer : undefined,
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        toast.error(json.error || "Couldn't sign you up. Try again in a moment.");
        return;
      }
      setDone(true);
      toast.success("You're on the list. We'll be in touch.");
    } catch {
      toast.error("Network error. Try again in a moment.");
    } finally {
      setSubmitting(false);
    }
  }

  if (done) {
    return (
      <div
        className={cn(
          "inline-flex items-center gap-2 rounded-full bg-primary/10 px-5 py-3 text-sm font-medium text-primary",
          className,
        )}
        role="status"
      >
        <CheckCircle2 className="size-4" />
        <span>Subscribed. Check your inbox soon.</span>
      </div>
    );
  }

  return (
    <form
      onSubmit={onSubmit}
      className={cn(
        variant === "inline"
          ? "flex w-full max-w-md flex-col gap-2 sm:flex-row"
          : "flex w-full max-w-md flex-col gap-2",
        className,
      )}
    >
      <Input
        type="email"
        inputMode="email"
        autoComplete="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder={placeholder}
        className={cn(
          variant === "inline" ? "sm:flex-1" : "",
          "h-12 rounded-full px-5 text-base",
        )}
        aria-label="Email address"
      />
      <Button
        type="submit"
        size="lg"
        disabled={submitting}
        className="h-12 rounded-full px-6 text-base"
      >
        {submitting ? "Submitting..." : cta}
        {!submitting && <ArrowRight className="size-4" />}
      </Button>
    </form>
  );
}
