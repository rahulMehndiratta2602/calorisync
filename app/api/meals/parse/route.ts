import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { getCurrentSession } from "@/lib/auth";
import { anthropic, AI_MODELS } from "@/lib/anthropic";
import type Anthropic from "@anthropic-ai/sdk";

type ContentBlockParam =
  | { type: "text"; text: string }
  | {
      type: "image";
      source: {
        type: "base64";
        media_type: "image/jpeg" | "image/png" | "image/webp" | "image/gif";
        data: string;
      };
    };

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const maxDuration = 60;

const bodySchema = z.object({
  mode: z.enum(["photo", "text"]),
  text: z.string().max(2000).optional(),
  imageBase64: z.string().max(15_000_000).optional(), // ~11 MB base64
  imageMimeType: z
    .enum(["image/jpeg", "image/png", "image/webp", "image/gif"])
    .optional(),
  mealType: z.enum(["breakfast", "lunch", "dinner", "snack", "other"]).optional(),
});

const PARSE_TOOL = {
  name: "log_meal",
  description:
    "Parse the meal into structured food items with macros. Be accurate; if unsure of an item or portion, mark confidence below 0.7 so the user is asked to confirm.",
  input_schema: {
    type: "object",
    properties: {
      meal_type: {
        type: "string",
        enum: ["breakfast", "lunch", "dinner", "snack", "other"],
        description:
          "Inferred meal type. Default to 'other' if unclear (snack outside meal times, etc).",
      },
      summary: {
        type: "string",
        description: "One-line plain-English summary, e.g. 'Grilled salmon with vegetables and quinoa'.",
      },
      items: {
        type: "array",
        description: "Each distinct food item in the meal.",
        items: {
          type: "object",
          properties: {
            name: { type: "string", description: "Human-readable food name (e.g. 'Grilled salmon')." },
            grams: { type: "number", description: "Estimated edible weight in grams." },
            kcal: { type: "number", description: "Estimated total kilocalories for this serving." },
            protein_g: { type: "number" },
            carbs_g: { type: "number" },
            fat_g: { type: "number" },
            fiber_g: { type: "number" },
            confidence: {
              type: "number",
              description: "Confidence 0.0 to 1.0 — be honest. Below 0.7 means user should review.",
            },
          },
          required: ["name", "grams", "kcal", "protein_g", "carbs_g", "fat_g", "confidence"],
        },
      },
      overall_confidence: {
        type: "number",
        description: "Average / lowest confidence across all items (0.0 to 1.0).",
      },
      notes: {
        type: "string",
        description: "Optional note for the user (e.g. 'I assumed olive oil for the dressing — adjust if different').",
      },
    },
    required: ["meal_type", "summary", "items", "overall_confidence"],
  },
} as const;

const SYSTEM_PROMPT = `You are a nutrition-savvy meal logger for Calorisync. Your job is to convert a meal photo or description into a precise structured log.

Rules:
- Estimate portion sizes from visual cues (plate size, hand-for-scale, fork/spoon present) or from explicit measurements in the user's text.
- Use realistic macros per 100g for each item. Common reference points:
  • Cooked chicken breast: ~165 kcal/100g, 31g protein
  • Cooked white rice: ~130 kcal/100g, 28g carbs
  • Salmon fillet: ~208 kcal/100g, 20g protein, 13g fat
  • Avocado: ~160 kcal/100g, 9g carbs, 15g fat
  • Eggs: ~155 kcal/100g, 13g protein, 11g fat
- Report calorie totals per ITEM (not per 100g). Multiply your per-100g estimate by actual grams.
- If you can't see / aren't told about portion size, estimate conservatively and set confidence between 0.5 and 0.7 so the user reviews.
- Don't invent items you can't see or that weren't mentioned.
- For ambiguous items (e.g. "a bowl of pasta"), give a reasonable default portion (1 cup ≈ 200g cooked pasta).
- Always call the log_meal tool with the structured result. Do not return prose.`;

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
    return NextResponse.json(
      { error: "Invalid request", details: parsed.error.flatten() },
      { status: 400 },
    );
  }

  const userContent: ContentBlockParam[] = [];

  if (parsed.data.mode === "photo") {
    if (!parsed.data.imageBase64 || !parsed.data.imageMimeType) {
      return NextResponse.json(
        { error: "photo mode requires imageBase64 and imageMimeType" },
        { status: 400 },
      );
    }
    userContent.push({
      type: "image",
      source: {
        type: "base64",
        media_type: parsed.data.imageMimeType,
        data: parsed.data.imageBase64,
      },
    });
    userContent.push({
      type: "text",
      text: "Log this meal. Identify each visible food item and estimate portions.",
    });
  } else {
    if (!parsed.data.text) {
      return NextResponse.json({ error: "text mode requires text" }, { status: 400 });
    }
    userContent.push({
      type: "text",
      text: `Parse this meal description into structured log entries:\n\n${parsed.data.text}`,
    });
  }

  try {
    const response = await anthropic.messages.create({
      model: AI_MODELS.vision,
      max_tokens: 1200,
      system: SYSTEM_PROMPT,
      tools: [PARSE_TOOL as unknown as Anthropic.Messages.Tool],
      tool_choice: { type: "tool", name: "log_meal" },
      messages: [{ role: "user", content: userContent as unknown as Anthropic.Messages.MessageParam["content"] }],
    });

    const toolUse = response.content.find((c) => c.type === "tool_use");
    if (!toolUse || toolUse.type !== "tool_use") {
      return NextResponse.json(
        { error: "AI didn't return a structured result", raw: response.content },
        { status: 502 },
      );
    }

    const result = toolUse.input as {
      meal_type: "breakfast" | "lunch" | "dinner" | "snack" | "other";
      summary: string;
      items: Array<{
        name: string;
        grams: number;
        kcal: number;
        protein_g: number;
        carbs_g: number;
        fat_g: number;
        fiber_g?: number;
        confidence: number;
      }>;
      overall_confidence: number;
      notes?: string;
    };

    const totals = result.items.reduce(
      (acc, it) => ({
        kcal: acc.kcal + (it.kcal || 0),
        protein_g: acc.protein_g + (it.protein_g || 0),
        carbs_g: acc.carbs_g + (it.carbs_g || 0),
        fat_g: acc.fat_g + (it.fat_g || 0),
      }),
      { kcal: 0, protein_g: 0, carbs_g: 0, fat_g: 0 },
    );

    return NextResponse.json({
      ok: true,
      parsed: result,
      totals,
      usage: {
        input_tokens: response.usage.input_tokens,
        output_tokens: response.usage.output_tokens,
      },
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[meals/parse] AI call failed:", msg);
    return NextResponse.json({ error: "AI parse failed", message: msg }, { status: 502 });
  }
}
