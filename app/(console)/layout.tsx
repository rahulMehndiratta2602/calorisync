import { redirect } from "next/navigation";
import { getCurrentSession } from "@/lib/auth";
import { ConsoleSidebar } from "@/components/console/sidebar";

export const dynamic = "force-dynamic";

export default async function ConsoleLayout({ children }: { children: React.ReactNode }) {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin?redirectTo=/console");

  return (
    <div className="min-h-screen bg-muted/20 md:grid md:grid-cols-[16rem_1fr]">
      <ConsoleSidebar userEmail={sess.user.email} userName={sess.user.name} />
      <main className="min-h-screen px-5 py-6 md:px-10 md:py-10">
        <div className="mx-auto max-w-5xl">{children}</div>
      </main>
    </div>
  );
}
