import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { anthropic, AI_MODELS } from "@/lib/anthropic";
import { buildChatSystemContext } from "@/lib/chat-context";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const messageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const bodySchema = z.object({
  messages: z.array(messageSchema).min(1).max(40),
});

export async function POST(req: NextRequest) {
  const sess = await getCurrentSession();
  if (!sess) return NextResponse.json({ error: "unauthorized" }, { status: 401 });

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid messages" }, { status: 400 });
  }

  const { systemPrompt, userFacts } = await buildChatSystemContext(sess.user.id);

  try {
    const response = await anthropic.messages.create({
      model: AI_MODELS.chat,
      max_tokens: 800,
      // CLAUDE.md says the cache breakpoint is at end of system prompt + user_facts.
      // cache_control is supported by the API but not yet in the SDK's TextBlockParam
      // typing at 0.32 — cast through unknown.
      system: [
        { type: "text", text: systemPrompt },
        { type: "text", text: userFacts, cache_control: { type: "ephemeral" } },
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      ] as unknown as { type: "text"; text: string }[],
      messages: parsed.data.messages,
    });

    const text = response.content
      .filter((c) => c.type === "text")
      .map((c) => (c.type === "text" ? c.text : ""))
      .join("\n")
      .trim();

    return NextResponse.json({
      ok: true,
      reply: text,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
        cache_creation_input_tokens:
          (response.usage as { cache_creation_input_tokens?: number }).cache_creation_input_tokens ?? 0,
        cache_read_input_tokens:
          (response.usage as { cache_read_input_tokens?: number }).cache_read_input_tokens ?? 0,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[chat] AI call failed:", msg);
    return NextResponse.json(
      { error: "Couldn't reach Claude right now. Try again in a moment." },
      { status: 502 },
    );
  }
}
