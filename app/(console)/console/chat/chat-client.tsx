"use client";

import * as React from "react";
import { toast } from "sonner";
import { Loader2, Send, Sparkles, User } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}

const SUGGESTIONS = [
  "How am I doing on protein this week?",
  "Suggest a 500-kcal lunch with 30g protein.",
  "Am I getting enough fiber?",
  "Quick keto-friendly snack ideas?",
];

export function ChatClient() {
  const [messages, setMessages] = React.useState<ChatMessage[]>([]);
  const [input, setInput] = React.useState("");
  const [sending, setSending] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement | null>(null);

  React.useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages, sending]);

  async function send(content: string) {
    const text = content.trim();
    if (!text || sending) return;

    const userMsg: ChatMessage = { role: "user", content: text, timestamp: Date.now() };
    const next = [...messages, userMsg];
    setMessages(next);
    setInput("");
    setSending(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          messages: next.map((m) => ({ role: m.role, content: m.content })),
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok || !json.ok) {
        toast.error(json.error || "Couldn't reach Claude right now.");
        // Drop the user message we just optimistically added so they can re-send.
        setMessages(next.slice(0, -1));
        setInput(text);
        return;
      }
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: json.reply, timestamp: Date.now() },
      ]);
    } catch {
      toast.error("Network error. Try again.");
      setMessages(next.slice(0, -1));
      setInput(text);
    } finally {
      setSending(false);
    }
  }

  function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    send(input);
  }

  function onKeyDown(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send(input);
    }
  }

  return (
    <Card className="flex flex-col">
      <CardContent className="flex h-[min(70vh,640px)] flex-col gap-4 p-0">
        <div ref={scrollRef} className="flex-1 overflow-y-auto scrollbar-thin p-5 sm:p-6">
          {messages.length === 0 ? (
            <div className="flex h-full flex-col items-center justify-center gap-5 text-center">
              <div className="grid size-12 place-items-center rounded-2xl bg-primary/10 text-primary">
                <Sparkles className="size-6" />
              </div>
              <p className="text-pretty text-sm text-muted-foreground">
                Ask anything about your macros. Try one of these to start:
              </p>
              <div className="flex max-w-md flex-wrap justify-center gap-2">
                {SUGGESTIONS.map((s) => (
                  <button
                    key={s}
                    type="button"
                    onClick={() => send(s)}
                    className="rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:bg-muted"
                  >
                    {s}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <ul className="flex flex-col gap-5">
              {messages.map((m, i) => (
                <li key={i} className={cn("flex gap-3", m.role === "user" && "flex-row-reverse")}>
                  <div
                    className={cn(
                      "grid size-8 shrink-0 place-items-center rounded-full text-xs font-semibold",
                      m.role === "user"
                        ? "bg-muted text-foreground"
                        : "bg-primary text-primary-foreground",
                    )}
                  >
                    {m.role === "user" ? <User className="size-4" /> : <Sparkles className="size-4" />}
                  </div>
                  <div
                    className={cn(
                      "max-w-[80%] rounded-2xl px-4 py-2.5 text-sm leading-relaxed",
                      m.role === "user"
                        ? "bg-primary text-primary-foreground"
                        : "bg-muted text-foreground",
                    )}
                  >
                    {m.content.split("\n").map((line, j) => (
                      <p key={j} className={j > 0 ? "mt-2" : ""}>
                        {line}
                      </p>
                    ))}
                  </div>
                </li>
              ))}
              {sending && (
                <li className="flex gap-3">
                  <div className="grid size-8 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                    <Sparkles className="size-4" />
                  </div>
                  <div className="rounded-2xl bg-muted px-4 py-2.5 text-sm">
                    <Loader2 className="size-4 animate-spin text-muted-foreground" />
                  </div>
                </li>
              )}
            </ul>
          )}
        </div>

        <form
          onSubmit={onSubmit}
          className="flex items-end gap-2 border-t border-border bg-card p-3 sm:p-4"
        >
          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Ask anything about your macros..."
            rows={1}
            disabled={sending}
            className="min-h-11 resize-none"
          />
          <Button type="submit" disabled={!input.trim() || sending} size="lg">
            {sending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
