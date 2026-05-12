import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms",
  description: "Calorisync terms of service.",
};

export default function TermsPage() {
  return (
    <article className="prose prose-zinc dark:prose-invert max-w-none">
      <p className="text-xs uppercase tracking-wider text-primary">Legal</p>
      <h1 className="font-display text-4xl font-medium tracking-tight">Terms of service</h1>
      <p className="text-sm text-muted-foreground">Last updated: May 2026</p>

      <Section title="Acceptance">
        <p>
          By using Calorisync you agree to these terms. If you don't agree, please don't use the
          service.
        </p>
      </Section>

      <Section title="What we promise">
        <p>
          We promise to make a genuinely useful calorie-tracking tool, treat your data with
          respect, and not paywall basic past-data access if you stop subscribing.
        </p>
      </Section>

      <Section title="What you promise">
        <ul>
          <li>You're at least 16 years old (or have parental consent).</li>
          <li>You won't try to disrupt the service or extract data you shouldn't.</li>
          <li>You won't use Calorisync as a substitute for medical advice. We are a logging tool,
            not a doctor.</li>
        </ul>
      </Section>

      <Section title="AI accuracy">
        <p>
          AI macro estimates are approximations, not guarantees. We aim for 95%+ accuracy on
          common meals but mistakes happen. Always review meals where the confidence score is
          below 70%, and adjust if you spot something off. Your corrections improve future
          estimates.
        </p>
      </Section>

      <Section title="Pricing & cancellation">
        <p>
          Pro is $9/month or $69/year, billed via Stripe. The 14-day trial requires no card
          up-front; we ask for one when the trial transitions to paid. Cancel anytime — you'll
          drop to the free tier immediately and keep read-only access to your history.
        </p>
        <p>
          If a payment fails, we give you 7 days to fix it before downgrading. We won't lock you
          out of past data.
        </p>
      </Section>

      <Section title="Liability">
        <p>
          The service is provided "as is" during open beta. We're not liable for indirect damages,
          and our maximum liability is limited to fees paid in the last 12 months.
        </p>
      </Section>

      <Section title="Changes">
        <p>
          We'll email any material changes to these terms at least 30 days before they take
          effect. Continuing to use the service after that means you accept the new terms.
        </p>
      </Section>

      <Section title="Contact">
        <p>
          Reach out at <a href="mailto:hello@calorisync.com">hello@calorisync.com</a>.
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
