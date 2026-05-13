import type { Metadata } from "next";
import { ChatClient } from "./chat-client";

export const metadata: Metadata = { title: "Chat with your coach" };

export default function ChatPage() {
  return (
    <div className="flex flex-col gap-4">
      <header>
        <p className="text-xs uppercase tracking-wider text-muted-foreground">AI coach</p>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Ask anything about your macros
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Powered by Claude. Your profile and the last 7 days of meals are part of the context.
        </p>
      </header>
      <ChatClient />
    </div>
  );
}
