import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Unsubscribed",
  description: "You've been unsubscribed from Calorisync emails.",
};

export default function UnsubscribedPage() {
  return (
    <article className="mx-auto max-w-md text-center">
      <div className="mx-auto grid size-14 place-items-center rounded-3xl bg-emerald-500/12 text-emerald-600 dark:text-emerald-400">
        <CheckCircle2 className="size-7" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-medium tracking-tight">
        You're unsubscribed
      </h1>
      <p className="mt-3 text-pretty text-sm text-muted-foreground">
        We won't send you any more newsletter emails. You'll still receive
        account-related emails (sign-in links, billing) if you have an active
        Calorisync account.
      </p>
      <div className="mt-8 flex justify-center gap-2">
        <Button asChild>
          <Link href="/">Back to home</Link>
        </Button>
      </div>
      <p className="mt-8 text-xs text-muted-foreground">
        Changed your mind? You can resubscribe anytime on the homepage.
      </p>
    </article>
  );
}
