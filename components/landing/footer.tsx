import * as React from "react";
import Link from "next/link";
import { landing } from "@/lib/landing-content";
import { Logo } from "@/components/logo";

export function LandingFooter() {
  const f = landing.footer;
  const year = new Date().getFullYear();
  return (
    <footer className="border-t border-border bg-muted/20">
      <div className="mx-auto w-full max-w-6xl px-5 py-16 sm:px-8">
        <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Logo />
            <p className="max-w-xs text-pretty text-sm text-muted-foreground">{f.tagline}</p>
          </div>
          {Object.entries(f.link_columns).map(([heading, links]) => (
            <div key={heading} className="flex flex-col gap-3">
              <p className="text-xs font-semibold uppercase tracking-wider text-foreground">
                {heading}
              </p>
              <ul className="flex flex-col gap-2">
                {links.map((l) => (
                  <li key={l.href}>
                    <Link
                      href={l.href}
                      className="text-sm text-muted-foreground transition-colors hover:text-foreground"
                    >
                      {l.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col items-start justify-between gap-3 border-t border-border pt-6 text-xs text-muted-foreground sm:flex-row sm:items-center">
          <p>{f.copyright.replace("{{year}}", String(year))}</p>
          <p className="font-mono">Built with care · web-first · open beta</p>
        </div>
      </div>
    </footer>
  );
}
