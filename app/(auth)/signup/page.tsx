import type { Metadata } from "next";
import { SigninForm } from "../signin/signin-form";

export const metadata: Metadata = {
  title: "Sign up",
  description: "Create your Calorisync account — 14-day free trial, no card required.",
};

// Sign-up and sign-in flow are identical via magic link; the page differs only
// in copy. We reuse the SigninForm component and let the verify endpoint
// upsert the user.
export default function SignUpPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  return <SigninForm errorPromise={searchParams} />;
}
