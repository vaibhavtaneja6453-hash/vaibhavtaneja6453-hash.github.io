import React, { useEffect, useRef } from "react";

export function AiMessageList({ messages, busy }) {
  const bodyRef = useRef(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [messages, busy]);

  return (
    <div ref={bodyRef} className="flex-1 overflow-auto p-3 flex flex-col gap-2.5" style={{ background: "var(--pm-bg)" }}>
      {messages.map((m, i) => (
        <div
          key={`${m.role}-${i}`}
          className={`max-w-[88%] px-3.5 py-2.5 rounded-2xl text-[15px] leading-snug whitespace-pre-line ${
            m.role === "user" ? "self-end text-white" : "self-start"
          }`}
          style={m.role === "user" ? { background: "var(--pm-secondary)" } : { background: "var(--pm-surface)", border: "1px solid var(--pm-border)", color: "var(--pm-ink)" }}
        >
          {m.content}
        </div>
      ))}
      {busy && <div className="self-start px-3.5 py-2.5 rounded-2xl text-pm-muted text-sm" style={{ background: "var(--pm-surface)", border: "1px solid var(--pm-border)" }}>Thinking…</div>}
    </div>
  );
}
