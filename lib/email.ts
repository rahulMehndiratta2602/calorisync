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
  | "weekly_summary";

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

// Adapter — currently stub-only (logs to DB + console).
// Mailpanzer plugs in by setting EMAIL_PROVIDER=mailpanzer and adding MAILPANZER_API_URL/KEY.
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

  if (provider === "stub") {
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
      .where(eq(schema.emailEvents.id, event.id));

    return { id: event.id, status: "stub_logged", provider };
  }

  // Future: Resend / SES / Mailpanzer branches go here.
  return { id: event.id, status: "queued", provider };
}

