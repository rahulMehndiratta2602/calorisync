"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  History,
  User,
  Settings,
  LogOut,
  Menu,
  X,
  Sparkles,
} from "lucide-react";
import { Logo } from "@/components/logo";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

const NAV = [
  { label: "Today", href: "/console", icon: LayoutDashboard },
  { label: "Log meal", href: "/console/log", icon: Plus, highlight: true },
  { label: "Chat coach", href: "/console/chat", icon: Sparkles },
  { label: "History", href: "/console/history", icon: History },
  { label: "Profile", href: "/console/profile", icon: User },
  { label: "Settings", href: "/console/settings", icon: Settings },
];

export function ConsoleSidebar({
  userEmail,
  userName,
}: {
  userEmail: string;
  userName?: string | null;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = React.useState(false);

  const Nav = (
    <nav className="flex flex-col gap-1">
      {NAV.map((item) => {
        const active =
          pathname === item.href ||
          (item.href !== "/console" && pathname.startsWith(item.href));
        const Icon = item.icon;
        return (
          <Link
            key={item.href}
            href={item.href}
            onClick={() => setMobileOpen(false)}
            className={cn(
              "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
              active
                ? "bg-primary/12 text-foreground"
                : "text-muted-foreground hover:bg-muted hover:text-foreground",
              item.highlight && !active && "bg-primary text-primary-foreground hover:bg-primary/90 hover:text-primary-foreground",
            )}
          >
            <Icon className="size-4 shrink-0" />
            <span>{item.label}</span>
          </Link>
        );
      })}
    </nav>
  );

  return (
    <>
      <button
        type="button"
        aria-label="Open menu"
        className="fixed left-4 top-4 z-30 grid size-10 place-items-center rounded-full border border-border bg-card shadow-sm md:hidden"
        onClick={() => setMobileOpen(true)}
      >
        <Menu className="size-4" />
      </button>

      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col gap-6 border-r border-border bg-card px-4 py-6 transition-transform md:sticky md:top-0 md:h-screen md:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex items-center justify-between">
          <Link href="/console" aria-label="Calorisync home">
            <Logo />
          </Link>
          <button
            type="button"
            aria-label="Close menu"
            className="grid size-8 place-items-center rounded-full text-muted-foreground hover:bg-muted md:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <X className="size-4" />
          </button>
        </div>

        {Nav}

        <div className="mt-auto flex flex-col gap-2 border-t border-border pt-4">
          <div className="flex items-center gap-3 rounded-xl bg-muted/40 px-3 py-2">
            <div
              className="grid size-9 place-items-center rounded-full bg-gradient-to-br from-primary to-chart-2 text-sm font-semibold text-primary-foreground"
              aria-hidden
            >
              {(userName || userEmail).charAt(0).toUpperCase()}
            </div>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium">{userName || "You"}</p>
              <p className="truncate text-xs text-muted-foreground">{userEmail}</p>
            </div>
          </div>
          <form action="/api/auth/signout" method="post">
            <Button
              type="submit"
              variant="ghost"
              size="sm"
              className="w-full justify-start gap-2 text-muted-foreground hover:text-foreground"
            >
              <LogOut className="size-4" />
              Sign out
            </Button>
          </form>
        </div>
      </aside>
    </>
  );
}
