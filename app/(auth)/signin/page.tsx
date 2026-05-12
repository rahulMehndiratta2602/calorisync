import type { Metadata } from "next";
import { SigninForm } from "./signin-form";

export const metadata: Metadata = {
  title: "Sign in",
  description: "Sign in to your Calorisync account with a magic link.",
};

export default function SignInPage({
  searchParams,
}: {
  searchParams?: Promise<{ error?: string }>;
}) {
  return <SigninForm errorPromise={searchParams} />;
}
