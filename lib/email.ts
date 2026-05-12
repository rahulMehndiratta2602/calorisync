import { eq } from "drizzle-orm";
import { db, schema } from "./db";
import { env } from "./env";

export type EmailTemplate =
  | "magic_link"
  | "welcome"
  | "trial_started"
  | "trial_ending_soon"
  | "trial_ended"
  | "subscription_renewed"
  | "newsletter_welcome"
  | "first_meal_logged"
  | "day_7_check_in"
  | "weekly_summary"
  | "account_deletion_confirmed";

export interface SendEmailArgs {
  to: string;
  template: EmailTemplate;
  payload: Record<string, unknown>;
  userId?: string;
}

export interface EmailResult {
  id: string;
  status: "queued" | "sent" | "stub_logged" | "failed";
  provider: string;
  error?: string;
}

// ─── Adapter ────────────────────────────────────────────────────────────────
// Calorisync's transactional email is intentionally pluggable. The provider is
// chosen at runtime via EMAIL_PROVIDER. Mailpanzer (the product under test) is
// just one option; we keep stub as the default so the app works without any
// outbound SMTP.
//
// All sends go through this `sendEmail` function which:
//   1) Writes a `pending` row to email_events (so the audit trail exists even
//      if the actual send fails).
//   2) Dispatches to the configured provider.
//   3) Updates the row with the final status + provider message id.

export async function sendEmail(args: SendEmailArgs): Promise<EmailResult> {
  const provider = env.EMAIL_PROVIDER;

  const [event] = await db
    .insert(schema.emailEvents)
    .values({
      recipient: args.to,
      template: args.template,
      payload: args.payload,
      userId: args.userId,
      status: "pending",
      provider,
    })
    .returning();

  try {
    if (provider === "stub") {
      return await stubSend(event.id, args);
    }
    if (provider === "mailpanzer") {
      return await mailpanzerSend(event.id, args);
    }
    // resend / ses branches will go here when wired.
    // Falls through to stub for unknown providers.
    return await stubSend(event.id, args);
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await db
      .update(schema.emailEvents)
      .set({ status: "failed", error: msg })
      .where(eq(schema.emailEvents.id, event.id));
    return { id: event.id, status: "failed", provider, error: msg };
  }
}

// ─── Stub (default) ─────────────────────────────────────────────────────────

async function stubSend(eventId: string, args: SendEmailArgs): Promise<EmailResult> {
  if (process.env.NODE_ENV !== "production") {
    console.log(
      `[email:stub] -> ${args.to} | template=${args.template} | payload=${JSON.stringify(
        args.payload,
      )}`,
    );
  }
  await db
    .update(schema.emailEvents)
    .set({ status: "stub_logged", sentAt: new Date() })
    .where(eq(schema.emailEvents.id, eventId));
  return { id: eventId, status: "stub_logged", provider: "stub" };
}

// ─── Mailpanzer ─────────────────────────────────────────────────────────────
// Expected Mailpanzer contract: POST {to, template, payload, from} →
//   200  { messageId: string, status: 'queued' | 'sent' }
//   4xx  { error: string }
// Adjust the body shape when Mailpanzer's API is finalized.

async function mailpanzerSend(eventId: string, args: SendEmailArgs): Promise<EmailResult> {
  if (!env.MAILPANZER_API_URL || !env.MAILPANZER_API_KEY) {
    // Misconfigured — fall back to stub so the app keeps working.
    console.warn("[email] EMAIL_PROVIDER=mailpanzer but URL/KEY missing — falling back to stub");
    return stubSend(eventId, args);
  }

  const res = await fetch(env.MAILPANZER_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${env.MAILPANZER_API_KEY}`,
    },
    body: JSON.stringify({
      from: env.EMAIL_FROM,
      to: args.to,
      template: args.template,
      payload: args.payload,
      eventId, // Mailpanzer can echo this back via webhook for status updates.
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => res.statusText);
    throw new Error(`mailpanzer http ${res.status}: ${errText.slice(0, 200)}`);
  }

  const json = (await res.json().catch(() => ({}))) as {
    messageId?: string;
    status?: "queued" | "sent";
  };

  await db
    .update(schema.emailEvents)
    .set({
      status: json.status === "sent" ? "sent" : "queued",
      providerMessageId: json.messageId,
      sentAt: json.status === "sent" ? new Date() : null,
    })
    .where(eq(schema.emailEvents.id, eventId));

  return {
    id: eventId,
    status: json.status === "sent" ? "sent" : "queued",
    provider: "mailpanzer",
  };
}
