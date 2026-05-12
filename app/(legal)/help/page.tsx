import type { Metadata } from "next";
import Link from "next/link";
import { landing } from "@/lib/landing-content";

export const metadata: Metadata = {
  title: "Help",
  description: "Calorisync help center — answers to common questions about logging, macros, and billing.",
};

export default function HelpPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Help</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Common questions
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          Can't find what you need? Email{" "}
          <a href="mailto:hello@calorisync.com" className="text-primary underline-offset-2 hover:underline">
            hello@calorisync.com
          </a>{" "}
          — we reply within a business day.
        </p>
      </header>

      <section className="mt-12 flex flex-col gap-6">
        {landing.faq.map((q) => (
          <details
            key={q.question}
            className="group rounded-2xl border border-border bg-card p-5 open:bg-card open:shadow-sm"
          >
            <summary className="cursor-pointer list-none text-base font-medium">
              {q.question}
            </summary>
            <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{q.answer}</p>
          </details>
        ))}
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-muted/30 p-6 text-center">
        <h2 className="font-display text-xl font-medium tracking-tight">Need more help?</h2>
        <p className="mt-2 text-sm text-muted-foreground">
          Email <a href="mailto:hello@calorisync.com" className="text-primary underline-offset-2 hover:underline">hello@calorisync.com</a> or read our{" "}
          <Link href="/privacy" className="text-primary underline-offset-2 hover:underline">privacy policy</Link>
          {" / "}
          <Link href="/terms" className="text-primary underline-offset-2 hover:underline">terms</Link>.
        </p>
      </section>
    </article>
  );
}
