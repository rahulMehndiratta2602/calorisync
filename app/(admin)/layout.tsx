import { redirect } from "next/navigation";
import Link from "next/link";
import { LayoutDashboard, Users, Mail, ListChecks, LogOut, Shield } from "lucide-react";
import { requireAdmin } from "@/lib/admin";
import { Logo } from "@/components/logo";

export const dynamic = "force-dynamic";

const NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Users", href: "/admin/users", icon: Users },
  { label: "Newsletter", href: "/admin/newsletter", icon: Mail },
  { label: "Email events", href: "/admin/email-events", icon: Mail },
  { label: "Audit log", href: "/admin/audit-log", icon: ListChecks },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const guard = await requireAdmin();
  if (!guard.ok) redirect(guard.redirectTo);

  return (
    <div className="min-h-screen bg-muted/20 md:grid md:grid-cols-[16rem_1fr]">
      <aside className="sticky top-0 hidden h-screen flex-col gap-6 border-r border-border bg-card px-4 py-6 md:flex">
        <Link href="/" aria-label="Calorisync home" className="flex items-center gap-2">
          <Logo />
          <span className="inline-flex items-center gap-1 rounded-full bg-destructive/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider text-destructive">
            <Shield className="size-3" />
            Admin
          </span>
        </Link>

        <nav className="flex flex-col gap-1">
          {NAV.map((item) => {
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
              >
                <Icon className="size-4 shrink-0" />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>

        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <Link
            href="/console"
            className="text-xs text-muted-foreground transition-colors hover:text-foreground"
          >
            ← Back to console
          </Link>
          <form action="/api/auth/signout" method="post">
            <button
              type="submit"
              className="flex items-center gap-2 text-xs text-muted-foreground transition-colors hover:text-foreground"
            >
              <LogOut className="size-3" />
              Sign out
            </button>
          </form>
        </div>
      </aside>

      <main className="px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  );
}
