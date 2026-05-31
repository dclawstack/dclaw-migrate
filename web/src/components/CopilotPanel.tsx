"use client";

import { useEffect, useRef, useState } from "react";
import { usePathname } from "next/navigation";
import { api } from "@/lib/api";

interface Message {
  role: "user" | "assistant";
  content: string;
}

interface ChatResponse {
  reply: string;
}

export default function CopilotPanel() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const pathname = usePathname();

  // Extract job_id from /jobs/[id] URL
  const jobIdMatch = pathname.match(/\/jobs\/([0-9a-f-]{36})/i);
  const jobId = jobIdMatch ? jobIdMatch[1] : null;

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function sendMessage() {
    const text = input.trim();
    if (!text || loading) return;

    const userMsg: Message = { role: "user", content: text };
    const history = messages.map((m) => ({ role: m.role, content: m.content }));

    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      const res = await api<ChatResponse>("/api/v1/ai/migrate-chat", {
        method: "POST",
        body: JSON.stringify({
          message: text,
          job_id: jobId ?? undefined,
          history,
        }),
      });
      setMessages((prev) => [...prev, { role: "assistant", content: res.reply }]);
    } catch (e: any) {
      setMessages((prev) => [
        ...prev,
        { role: "assistant", content: `⚠️ Error: ${e.message}` },
      ]);
    } finally {
      setLoading(false);
    }
  }

  function handleKey(e: React.KeyboardEvent) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }

  return (
    <>
      {/* Floating trigger */}
      <button
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-6 right-6 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-2xl text-primary-foreground shadow-lg transition-all hover:opacity-90"
        aria-label="Open AI Copilot"
      >
        {open ? "✕" : "✦"}
      </button>

      {/* Panel */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 flex h-[520px] w-96 flex-col overflow-hidden rounded-2xl border border-border bg-white shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between bg-primary px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-primary-foreground">DClaw Migrate Copilot</p>
              {jobId && (
                <p className="text-xs text-primary-foreground/70">Context: current job</p>
              )}
            </div>
            <button onClick={() => setMessages([])} className="text-xs text-primary-foreground/70 hover:text-primary-foreground">
              Clear
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 space-y-3 overflow-y-auto bg-secondary px-4 py-3">
            {messages.length === 0 && (
              <div className="mt-8 text-center text-sm text-muted-foreground">
                <p className="mb-2 text-2xl text-primary">✦</p>
                <p>Ask me anything about your migration.</p>
                <p className="mt-1 text-xs">e.g. &quot;What are the risks of this migration?&quot;</p>
              </div>
            )}
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div
                  className={`max-w-[80%] whitespace-pre-wrap rounded-2xl px-3 py-2 text-sm ${
                    msg.role === "user"
                      ? "rounded-br-sm bg-primary text-primary-foreground"
                      : "rounded-bl-sm border border-border bg-white text-foreground shadow-sm"
                  }`}
                >
                  {msg.content}
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex justify-start">
                <div className="rounded-2xl rounded-bl-sm border border-border bg-white px-3 py-2 text-sm text-muted-foreground shadow-sm">
                  Thinking…
                </div>
              </div>
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="flex gap-2 border-t border-border bg-white px-3 py-2">
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={handleKey}
              placeholder="Ask about your migration…"
              rows={2}
              className="flex-1 resize-none rounded-lg border border-input px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="self-end rounded-full bg-primary px-4 py-2 text-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-40"
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
