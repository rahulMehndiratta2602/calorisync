// This page won't typically render — the verify API redirects on success.
// If a user lands here directly (no token), we send them to /signin.
import { redirect } from "next/navigation";

export default async function AuthVerifyPage({
  searchParams,
}: {
  searchParams?: Promise<{ token?: string }>;
}) {
  const sp = (await searchParams) ?? {};
  if (!sp.token) redirect("/signin?error=missing_token");
  // If somehow this page renders before the API redirect, server-redirect to it.
  redirect(`/api/auth/verify?token=${encodeURIComponent(sp.token)}`);
}
