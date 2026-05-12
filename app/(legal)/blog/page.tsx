import type { Metadata } from "next";
import Link from "next/link";
import { Mail } from "lucide-react";

export const metadata: Metadata = {
  title: "Blog",
  description: "Calorisync blog — notes on AI nutrition, macros, and product updates.",
};

export default function BlogPage() {
  return (
    <article className="mx-auto max-w-2xl text-center">
      <p className="text-xs uppercase tracking-wider text-primary">Blog</p>
      <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
        Coming soon
      </h1>
      <p className="mt-4 text-pretty text-base text-muted-foreground sm:text-lg">
        We're heads-down shipping the product right now. When we have something worth saying about
        macros, AI, and the philosophy behind a tracker that gets out of your way, it'll land here.
      </p>
      <div className="mt-8 rounded-2xl border border-border bg-card p-6">
        <Mail className="mx-auto size-5 text-primary" />
        <p className="mt-3 text-sm font-medium">Get notified when we publish</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Subscribe to the newsletter on the{" "}
          <Link href="/" className="text-primary underline-offset-2 hover:underline">
            homepage
          </Link>{" "}
          and you'll hear about new posts.
        </p>
      </div>
    </article>
  );
}
