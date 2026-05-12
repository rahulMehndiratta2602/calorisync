import type { Metadata } from "next";
import { Mail, Github, MessageSquare } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export const metadata: Metadata = {
  title: "Contact",
  description: "Get in touch with the Calorisync team — support, partnerships, or press.",
};

export default function ContactPage() {
  return (
    <article className="mx-auto max-w-3xl">
      <header className="text-center">
        <p className="text-xs uppercase tracking-wider text-primary">Contact</p>
        <h1 className="mt-3 font-display text-4xl font-medium tracking-tight">
          Talk to a human
        </h1>
        <p className="mt-3 text-sm text-muted-foreground">
          We answer email within a business day during open beta.
        </p>
      </header>

      <section className="mt-12 grid gap-4 sm:grid-cols-2">
        <ContactCard
          icon={<Mail className="size-5 text-primary" />}
          title="General questions"
          email="hello@calorisync.com"
          subtitle="Anything from how-to to partnerships."
        />
        <ContactCard
          icon={<MessageSquare className="size-5 text-primary" />}
          title="Support"
          email="hello@calorisync.com?subject=Calorisync support"
          subtitle="Bugs, billing, or anything broken."
        />
        <ContactCard
          icon={<Mail className="size-5 text-primary" />}
          title="Press"
          email="press@calorisync.com"
          subtitle="Interviews, screenshots, or company info."
        />
        <ContactCard
          icon={<Mail className="size-5 text-primary" />}
          title="Security"
          email="security@calorisync.com"
          subtitle="Responsible disclosure — see /security."
        />
      </section>

      <section className="mt-12 rounded-2xl border border-border bg-card p-6 text-sm text-muted-foreground">
        <p>
          <strong className="text-foreground">Open beta status:</strong> Calorisync is a small team
          shipping fast. If something feels half-built or you want a feature added, we'd love to
          hear it — your feedback shapes what we build next.
        </p>
      </section>
    </article>
  );
}

function ContactCard({
  icon,
  title,
  email,
  subtitle,
}: {
  icon: React.ReactNode;
  title: string;
  email: string;
  subtitle: string;
}) {
  const cleanEmail = email.split("?")[0];
  return (
    <Card>
      <CardContent className="flex flex-col gap-2 p-5">
        {icon}
        <h2 className="text-base font-semibold">{title}</h2>
        <p className="text-sm text-muted-foreground">{subtitle}</p>
        <a
          href={`mailto:${email}`}
          className="mt-1 text-sm font-medium text-primary underline-offset-2 hover:underline"
        >
          {cleanEmail}
        </a>
      </CardContent>
    </Card>
  );
}
