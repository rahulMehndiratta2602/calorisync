import Link from "next/link";
import { Compass, ArrowRight } from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <div className="relative isolate flex min-h-screen flex-col bg-background">
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-radial-fade opacity-50" />
        <div className="absolute left-1/2 top-32 h-64 w-64 -translate-x-1/2 rounded-full bg-primary/8 blur-3xl" />
      </div>

      <header className="border-b border-border/40">
        <div className="mx-auto flex h-16 w-full max-w-6xl items-center px-5 sm:px-8">
          <Link href="/" aria-label="Calorisync home">
            <Logo />
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-5 py-16">
        <div className="max-w-md text-center">
          <div className="mx-auto grid size-16 place-items-center rounded-3xl bg-primary/10 text-primary">
            <Compass className="size-7" />
          </div>
          <p className="mt-6 font-mono text-xs uppercase tracking-wider text-muted-foreground">
            404 · not found
          </p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight sm:text-5xl">
            Off the beaten plate
          </h1>
          <p className="mt-4 text-pretty text-base text-muted-foreground">
            We couldn't find that page. It may have been moved, or you might be looking for
            something else entirely.
          </p>

          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Button asChild size="lg">
              <Link href="/">
                Home <ArrowRight className="size-4" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline">
              <Link href="/demo">Try the demo</Link>
            </Button>
          </div>

          <div className="mt-10 grid grid-cols-2 gap-3 text-left text-sm sm:grid-cols-3">
            {[
              { label: "Features", href: "/features" },
              { label: "Pricing", href: "/pricing" },
              { label: "Help", href: "/help" },
              { label: "About", href: "/about" },
              { label: "Sign in", href: "/signin" },
              { label: "Contact", href: "/contact" },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="rounded-xl border border-border bg-card/60 px-3 py-2 text-muted-foreground transition-colors hover:text-foreground"
              >
                {l.label} →
              </Link>
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
