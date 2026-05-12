import { redirect } from "next/navigation";
import { eq } from "drizzle-orm";
import { getCurrentSession } from "@/lib/auth";
import { db, schema } from "@/lib/db";
import { OnboardingForm } from "./onboarding-form";

export const metadata = { title: "Welcome" };
export const dynamic = "force-dynamic";

export default async function OnboardingPage() {
  const sess = await getCurrentSession();
  if (!sess) redirect("/signin");

  const profile = await db.query.userProfiles.findFirst({
    where: eq(schema.userProfiles.userId, sess.user.id),
  });

  if (profile?.onboardedAt) redirect("/console");

  return <OnboardingForm userEmail={sess.user.email} />;
}
