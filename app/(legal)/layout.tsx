import Link from "next/link";
import { Logo } from "@/components/logo";
import { LandingFooter } from "@/components/landing/footer";

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border/60">
        <div className="mx-auto flex h-16 w-full max-w-3xl items-center justify-between px-5">
          <Link href="/" aria-label="Calorisync home">
            <Logo />
          </Link>
          <Link
            href="/"
            className="text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back
          </Link>
        </div>
      </header>
      <main className="mx-auto w-full max-w-3xl px-5 py-12 sm:py-16">{children}</main>
      <LandingFooter />
    </div>
  );
}
