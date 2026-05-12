import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Changelog",
  description: "What's new in Calorisync — feature releases, fixes, and improvements.",
};

const ENTRIES = [
  {
    date: "2026-05-13",
    title: "Open beta launch",
    body: [
      "Public landing page with photo, voice, and text meal-logging.",
      "Magic-link authentication (no passwords).",
      "Personalized macro targets based on weight, goal, and diet style.",
      "Full meal history with CSV export.",
      "Admin dashboard for newsletter and email-event monitoring.",
    ],
  },
];

export default function ChangelogPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Changelog</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">What's new</h1>
      </header>

      <ol className="mt-12 flex flex-col gap-10">
        {ENTRIES.map((entry) => (
          <li key={entry.date} className="border-l-2 border-primary/30 pl-6">
            <p className="text-xs uppercase tracking-wider text-muted-foreground">{entry.date}</p>
            <h2 className="mt-1 text-xl font-semibold tracking-tight">{entry.title}</h2>
            <ul className="mt-4 flex flex-col gap-2">
              {entry.body.map((line) => (
                <li key={line} className="flex items-start gap-2 text-sm">
                  <span className="mt-2 size-1 shrink-0 rounded-full bg-primary" />
                  <span className="text-muted-foreground">{line}</span>
                </li>
              ))}
            </ul>
          </li>
        ))}
      </ol>
    </article>
  );
}
