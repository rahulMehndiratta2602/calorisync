import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy",
  description:
    "Calorisync privacy policy — what data we collect, how we use it, and how we protect it.",
};

export default function PrivacyPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-xs uppercase tracking-wider text-primary">Legal</p>
      <h1 className="font-display text-4xl font-medium tracking-tight">Privacy policy</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <Section title="What we collect">
        <p>
          When you sign up, we collect your email address and the profile data you choose to share
          (age, weight, height, goal, diet style, time zone). When you log meals we store the AI's
          structured parse of each meal — food name, portion estimate, macros — along with optional
          photos you upload.
        </p>
        <p>
          We log technical metadata for security: IP address, user agent, and timestamps for
          sign-ins and active sessions.
        </p>
      </Section>

      <Section title="What we don't do">
        <ul>
          <li>We don't sell your data. Period.</li>
          <li>We don't use your meal photos to train any AI model.</li>
          <li>We don't send marketing emails unless you explicitly opt-in.</li>
          <li>We don't share your information with third parties except as required to operate
            the service (e.g., our cloud database provider, payment processor).</li>
        </ul>
      </Section>

      <Section title="How we use it">
        <p>
          Your profile and meal data power Calorisync. AI parsing requests are sent to our model
          provider (Anthropic) to generate macros, then immediately discarded by the provider per
          their data-usage terms. We retain only the structured output.
        </p>
      </Section>

      <Section title="Your rights">
        <p>
          You can export all your data as CSV from your account settings, or request full deletion
          by emailing <a href="mailto:hello@calorisync.com">hello@calorisync.com</a>. We'll process
          deletion requests within 30 days.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Questions about this policy? Email{" "}
          <a href="mailto:hello@calorisync.com">hello@calorisync.com</a>.
        </p>
      </Section>
    </article>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="mt-10 text-xl font-semibold">{title}</h2>
      {children}
    </>
  );
}
