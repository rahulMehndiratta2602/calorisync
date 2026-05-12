import { env } from "./env";
import { getCurrentSession } from "./auth";

type Session = NonNullable<Awaited<ReturnType<typeof getCurrentSession>>>;

type AdminGuard =
  | { ok: true; sess: Session }
  | { ok: false; redirectTo: string };

export async function requireAdmin(): Promise<AdminGuard> {
  const sess = await getCurrentSession();
  if (!sess) return { ok: false, redirectTo: "/signin?redirectTo=/admin" };

  const email = sess.user.email.toLowerCase();
  const isAdmin =
    sess.user.role === "admin" ||
    sess.user.role === "superadmin" ||
    env.ADMIN_EMAILS.includes(email);

  if (!isAdmin) return { ok: false, redirectTo: "/console" };
  return { ok: true, sess };
}

export function isAdminEmail(email: string): boolean {
  return env.ADMIN_EMAILS.includes(email.toLowerCase());
}
