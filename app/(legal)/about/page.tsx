import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "About",
  description: "About Calorisync — the AI-first, web-first calorie tracker.",
};

export default function AboutPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-xs uppercase tracking-wider text-primary">About</p>
      <h1 className="font-display text-4xl font-medium tracking-tight">
        Built for people who hate logging
      </h1>

      <p className="text-lg text-muted-foreground">
        Calorisync exists because every existing calorie tracker felt like a chore. Logging a day's
        meals with traditional trackers can eat 10–15 minutes if you're conscientious about
        portions. That's dozens of hours a year you'd never get back.
      </p>

      <p>
        We started with one question: <em>can AI cut a meal-log to under five seconds?</em> After
        a year of testing photo + voice + text parsing, the answer is yes. Most meals land at
        3–7 seconds with a single tap to accept or edit.
      </p>

      <h2 className="mt-10 text-xl font-semibold">Web-first, on purpose</h2>
      <p>
        Most modern calorie trackers went mobile-app-first. We went web-first because every device
        — your laptop, your phone browser, even the iPad on your kitchen counter — should be able to
        log a meal in the same flow. No App Store review timelines. No 30% revenue cut on
        subscriptions. Just a URL that works.
      </p>

      <h2 className="mt-10 text-xl font-semibold">What we won't do</h2>
      <ul>
        <li>Sell your data, or use your photos to train competitors' models.</li>
        <li>Lock past history behind a paywall.</li>
        <li>Gamify or shame your eating. You're an adult.</li>
        <li>Add features that don't earn their keep — every screen, every button, has to justify the
          cognitive cost.</li>
      </ul>

      <h2 className="mt-10 text-xl font-semibold">Where we're going</h2>
      <p>
        Right now Calorisync is open-beta. The current priority list: smarter portion estimation
        from a single photo, Apple Health and Garmin sync, a chat-style coach for diet questions,
        and meal recommendations based on what you've already logged this week.
      </p>

      <div className="not-prose mt-12 flex gap-3">
        <Button asChild size="lg">
          <Link href="/signup">Get started free</Link>
        </Button>
        <Button asChild size="lg" variant="outline">
          <Link href="/">Back to home</Link>
        </Button>
      </div>
    </article>
  );
}
