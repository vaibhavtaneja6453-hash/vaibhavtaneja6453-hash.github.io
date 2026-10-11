import React, { useEffect, useState } from "react";
import { api } from "../lib/api";
import { useAuth } from "../context/AuthContext";
import { MessageCircle, X, Send, Sparkles } from "lucide-react";
import { AiMessageList } from "./ai/AiMessageList";

const QUICK = ["How do I use this?", "What do the colours mean?", "Is my data safe?", "Explain pain severity", "Emergency help"];
const WELCOME = "Hi! I'm the Pain Map assistant. Ask me how to use the app, what the colours mean, or anything about describing your pain. I can't diagnose or prescribe.";

export default function FloatingAIAssistant() {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    if (open) setMessages((m) => (m.length === 0 ? [{ role: "assistant", content: WELCOME }] : m));
  }, [open]);

  const send = async (text) => {
    const q = (text ?? input).trim();
    if (!q || busy) return;
    const next = [...messages, { role: "user", content: q }];
    setMessages(next);
    setInput("");
    setBusy(true);
    try {
      const { data } = await api.post("/assistant/chat", { messages: next.filter((m) => m.role !== "system"), context: "" });
      setMessages([...next, { role: "assistant", content: data.text }]);
    } catch {
      setMessages([...next, { role: "assistant", content: "I'm having trouble right now. For urgent symptoms call your local emergency number (112 in India)." }]);
    } finally {
      setBusy(false);
    }
  };

  if (!user) return null;

  return (
    <>
      {!open && (
        <button
          onClick={() => setOpen(true)}
          data-testid="floating-ai-assistant-toggle-btn"
          className="fixed z-40 right-5 bottom-20 md:bottom-6 flex items-center gap-2 pl-4 pr-5 py-3 rounded-full text-white font-bold shadow-lg"
          style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}
        >
          <span className="relative flex">
            <span className="absolute inline-flex h-full w-full rounded-full bg-white/40 animate-pulse-ring" />
            <Sparkles className="w-5 h-5 relative" />
          </span>
          Ask AI
        </button>
      )}

      {open && (
        <section
          className="fixed z-50 right-3 left-3 md:left-auto bottom-20 md:bottom-6 md:right-6 md:w-[400px] h-[72vh] md:h-[560px] flex flex-col overflow-hidden rounded-3xl shadow-2xl border"
          style={{ background: "var(--pm-surface)", borderColor: "var(--pm-border)" }}
          role="dialog"
          aria-label="AI help assistant"
        >
          <div className="flex items-center justify-between px-4 py-3 text-white" style={{ background: "linear-gradient(135deg,var(--pm-primary),var(--pm-secondary))" }}>
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5" />
              <div>
                <p className="font-bold leading-tight">Pain Map Assistant</p>
                <p className="text-[11px] opacity-90">Not a doctor · can be wrong</p>
              </div>
            </div>
            <button onClick={() => setOpen(false)} aria-label="Close" className="w-9 h-9 grid place-items-center rounded-full hover:bg-white/20">
              <X className="w-5 h-5" />
            </button>
          </div>

          <AiMessageList messages={messages} busy={busy} />

          <div className="px-3 pt-2 flex gap-1.5 flex-wrap max-h-24 overflow-auto" style={{ background: "var(--pm-surface)" }}>
            {QUICK.map((q) => (
              <button key={q} onClick={() => send(q)} className="pm-chip !min-h-[34px] !py-1 !px-3 !text-[13px]">
                {q}
              </button>
            ))}
          </div>

          <div className="flex gap-2 p-3 border-t" style={{ borderColor: "var(--pm-border)", background: "var(--pm-surface)" }}>
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && send()}
              placeholder="Ask a question…"
              data-testid="ai-assistant-message-input"
              className="pm-input flex-1 !min-h-[44px]"
            />
            <button onClick={() => send()} disabled={busy} data-testid="ai-assistant-send-btn" className="pm-btn !min-h-[44px] !px-4">
              <Send className="w-5 h-5" />
            </button>
          </div>
        </section>
      )}
    </>
  );
}
