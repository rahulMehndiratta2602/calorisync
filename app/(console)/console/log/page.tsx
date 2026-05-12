import type { Metadata } from "next";
import { LogMealClient } from "./log-meal-client";

export const metadata: Metadata = { title: "Log a meal" };

export default function LogMealPage() {
  return (
    <div className="flex flex-col gap-2">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">Log a meal</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          What did you eat?
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Snap a photo, speak it, or type it. AI handles macros automatically.
        </p>
      </header>
      <LogMealClient />
    </div>
  );
}
