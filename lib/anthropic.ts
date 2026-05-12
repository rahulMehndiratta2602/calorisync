import Anthropic from "@anthropic-ai/sdk";
import { env } from "./env";

const globalForAnthropic = globalThis as unknown as { anthropic?: Anthropic };

export const anthropic =
  globalForAnthropic.anthropic ??
  new Anthropic({ apiKey: env.ANTHROPIC_API_KEY });

if (process.env.NODE_ENV !== "production") globalForAnthropic.anthropic = anthropic;

export const AI_MODELS = {
  vision: "claude-sonnet-4-6",
  chat: "claude-sonnet-4-6",
  cheap: "claude-haiku-4-5",
} as const;

export const AI_CONFIDENCE_THRESHOLD = 0.7;
