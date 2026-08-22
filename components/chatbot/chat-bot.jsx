"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { usePathname } from "next/navigation";
import { formatPrice } from "@/lib/utils";

// Same-origin path: Next.js rewrites /api/* to the backend, avoiding CORS
// regardless of which localhost port the site runs on.
const API_BASE = process.env.NEXT_PUBLIC_API_URL || "/api";

function generateSessionId() {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function getSessionId() {
  if (typeof window === "undefined") return generateSessionId();
  let id = localStorage.getItem("chatbot_session_id");
  if (!id) {
    id = generateSessionId();
    localStorage.setItem("chatbot_session_id", id);
  }
  return id;
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function SourceCard({ product }) {
  return (
    <a
      href={`/products/${encodeURIComponent(product.category)}/${encodeURIComponent(product.id)}`}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 rounded-lg border border-border bg-card p-2 text-xs hover:bg-accent transition-colors"
    >
      {product.image && (
        <img
          src={product.image}
          alt={product.name}
          className="h-8 w-8 rounded object-contain shrink-0 bg-muted"
        />
      )}
      <div className="min-w-0">
        <p className="font-medium text-foreground truncate">{product.name}</p>
        <p className="text-muted-foreground">{formatPrice(product.price)}</p>
      </div>
    </a>
  );
}

function Message({ msg }) {
  const isUser = msg.role === "user";

  return (
    <div className={`flex ${isUser ? "justify-end" : "justify-start"} mb-3`}>
      <div className={`max-w-[85%] ${isUser ? "order-2" : "order-1"}`}>
        {!isUser && (
          <div className="flex items-center gap-1.5 mb-1">
            <div className="h-5 w-5 rounded-full bg-gradient-brand flex items-center justify-center shrink-0 shadow-[var(--shadow-card)]">
              <svg className="h-3 w-3 text-white" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
              </svg>
            </div>
            <span className="text-xs text-muted-foreground font-medium">SpecSmart AI</span>
          </div>
        )}

        <div
          className={`rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed whitespace-pre-wrap shadow-[var(--shadow-card)] ${
            isUser
              ? "bg-gradient-brand text-white rounded-tr-sm"
              : "bg-card border border-border/60 text-foreground rounded-tl-sm"
          }`}
        >
          {msg.text}
          {msg.streaming && (
            <span className="inline-block ml-0.5 h-4 w-0.5 bg-current opacity-70 animate-pulse" />
          )}
        </div>

        {msg.sources && msg.sources.length > 0 && (
          <div className="mt-2 space-y-1.5">
            <p className="text-xs text-muted-foreground font-medium px-1">
              Referenced products:
            </p>
            {msg.sources.map((s) => (
              <SourceCard key={s.id} product={s} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function TypingIndicator() {
  return (
    <div className="flex justify-start mb-3">
      <div className="bg-card border border-border/60 rounded-2xl rounded-tl-sm px-4 py-3">
        <div className="flex gap-1">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className="h-2 w-2 rounded-full bg-muted-foreground animate-bounce"
              style={{ animationDelay: `${i * 150}ms` }}
            />
          ))}
        </div>
      </div>
    </div>
  );
}

// ─── Main ChatBot ─────────────────────────────────────────────────────────────

export default function ChatBot() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: "welcome",
      role: "assistant",
      text: "Hi! I'm your SpecSmart assistant. Ask me anything about our products — specs, pricing, comparisons, availability, and more.",
      sources: [],
    },
  ]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const messagesEndRef = useRef(null);
  const inputRef = useRef(null);
  const abortRef = useRef(null);
  const launcherRef = useRef(null);
  const panelRef = useRef(null);
  const sessionId = useRef(getSessionId());

  useEffect(() => {
    if (isOpen) {
      messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages, isOpen]);

  useEffect(() => {
    if (isOpen) inputRef.current?.focus();
  }, [isOpen]);

  // Route changes must never leave the chat overlay open.
  useEffect(() => {
    setIsOpen(false);
  }, [pathname]);

  // Outside click closes the chat; clicks inside never do.
  // Escape closes it as well and restores focus to the launcher.
  // Listeners are passive observers (no preventDefault/stopPropagation)
  // so portals, dropdowns and inputs keep working normally.
  useEffect(() => {
    if (!isOpen) return;

    const handlePointerDown = (event) => {
      const target = event.target;
      if (!(target instanceof Node)) return;
      if (panelRef.current?.contains(target)) return;
      // The launcher manages its own toggle on click; ignore it here so
      // pointerdown-close + click-toggle don't fight each other.
      if (launcherRef.current?.contains(target)) return;
      setIsOpen(false);
    };

    const handleKeyDown = (event) => {
      if (event.key !== "Escape") return;
      // Let an open Radix menu/popover consume its own Escape first.
      const target = event.target;
      if (
        event.defaultPrevented ||
        (target instanceof Element &&
          target.closest("[data-radix-popper-content-wrapper]"))
      ) {
        return;
      }
      setIsOpen(false);
      requestAnimationFrame(() => launcherRef.current?.focus());
    };

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [isOpen]);

  // Abort any in-flight stream when the component unmounts.
  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || isStreaming) return;

    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    const botId = `b-${Date.now()}`;
    const botMsg = { id: botId, role: "assistant", text: "", streaming: true, sources: [] };

    setMessages((prev) => [...prev, userMsg, botMsg]);
    setInput("");
    setIsStreaming(true);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch(`${API_BASE}/chatbot/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ message: text, sessionId: sessionId.current }),
        signal: controller.signal,
      });

      if (!res.ok || !res.body) {
        throw new Error(`HTTP ${res.status}`);
      }

      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let buffer = "";

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split("\n");
        buffer = lines.pop(); // keep incomplete last line

        for (const line of lines) {
          if (!line.startsWith("data:")) continue;
          try {
            const event = JSON.parse(line.slice(5).trim());

            if (event.type === "chunk") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId ? { ...m, text: m.text + event.text } : m,
                ),
              );
            } else if (event.type === "done") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId
                    ? { ...m, streaming: false, sources: event.sources || [] }
                    : m,
                ),
              );
            } else if (event.type === "error") {
              setMessages((prev) =>
                prev.map((m) =>
                  m.id === botId
                    ? { ...m, text: event.message, streaming: false, isError: true }
                    : m,
                ),
              );
            }
          } catch {
            // malformed SSE line — skip
          }
        }
      }
    } catch (err) {
      if (err.name !== "AbortError") {
        setMessages((prev) =>
          prev.map((m) =>
            m.id === botId
              ? {
                  ...m,
                  text: "Sorry, I couldn't connect to the server. Please try again.",
                  streaming: false,
                  isError: true,
                }
              : m,
          ),
        );
      }
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }, [input, isStreaming]);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  const clearChat = async () => {
    // Clear server-side history.
    fetch(`${API_BASE}/chatbot/session`, {
      method: "DELETE",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ sessionId: sessionId.current }),
    }).catch(() => {});

    // Generate a fresh local session.
    sessionId.current = generateSessionId();
    localStorage.setItem("chatbot_session_id", sessionId.current);

    setMessages([
      {
        id: "welcome",
        role: "assistant",
        text: "Conversation cleared. How can I help you?",
        sources: [],
      },
    ]);
  };

  const stopStream = () => {
    abortRef.current?.abort();
    setMessages((prev) =>
      prev.map((m) => (m.streaming ? { ...m, streaming: false } : m)),
    );
    setIsStreaming(false);
  };

  return (
    <>
      {/* Floating toggle button */}
      <button
        ref={launcherRef}
        onClick={() => setIsOpen((o) => !o)}
        aria-label={isOpen ? "Close chat" : "Open chat"}
        aria-expanded={isOpen}
        aria-controls="specsmart-chat-panel"
        aria-haspopup="dialog"
        className="fixed bottom-[calc(1.5rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] z-[60] flex h-14 w-14 items-center justify-center rounded-full bg-gradient-brand text-white shadow-[var(--shadow-glow)] hover:brightness-110 active:scale-95 transition-all shine"
      >
        {isOpen ? (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        )}
      </button>

      {/* Chat window */}
      {isOpen && (
        <div
          id="specsmart-chat-panel"
          role="dialog"
          aria-label="SpecSmart AI chat"
          ref={panelRef}
          className="fixed bottom-[calc(5.75rem+env(safe-area-inset-bottom))] right-[calc(1.5rem+env(safe-area-inset-right))] z-[60] flex flex-col w-90 max-w-[calc(100vw-3rem-env(safe-area-inset-right))] h-130 max-h-[calc(100vh-9.25rem-env(safe-area-inset-bottom))] rounded-2xl bg-background/95 backdrop-blur-xl shadow-[var(--shadow-lift)] border border-border/60 overflow-hidden animate-in fade-in zoom-in-95"
        >

          {/* Header */}
          <div className="relative flex items-center justify-between px-4 py-3 bg-gradient-brand text-white shrink-0 overflow-hidden">
            <div aria-hidden="true" className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,rgba(255,255,255,0.2),transparent_60%)]" />
            <div className="relative flex items-center gap-2">
              <div className="h-8 w-8 rounded-full bg-white/20 flex items-center justify-center">
                <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 14.5v-9l6 4.5-6 4.5z" />
                </svg>
              </div>
              <div>
                <p className="text-sm font-semibold leading-none">SpecSmart AI</p>
                <p className="text-xs text-white/70 mt-0.5">Product assistant</p>
              </div>
            </div>
            <button
              onClick={clearChat}
              title="Clear conversation"
              className="relative rounded-lg p-1.5 hover:bg-white/20 transition-colors text-white/70 hover:text-white"
            >
              <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto px-4 pt-4 pb-2">
            {messages.map((msg) => (
              <Message key={msg.id} msg={msg} />
            ))}
            {isStreaming && messages[messages.length - 1]?.text === "" && (
              <TypingIndicator />
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input area */}
          <div className="shrink-0 border-t border-border p-3">
            <div className="flex items-end gap-2">
              <textarea
                ref={inputRef}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Ask about products, specs, pricing…"
                rows={1}
                maxLength={1000}
                disabled={isStreaming}
                className="flex-1 resize-none rounded-xl border border-border/60 bg-card/60 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/50 hover:border-ring/40 disabled:opacity-50 max-h-24 overflow-y-auto transition-all"
                style={{ lineHeight: "1.4" }}
              />
              {isStreaming ? (
                <button
                  onClick={stopStream}
                  title="Stop"
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-destructive hover:bg-destructive/90 text-white transition-colors"
                >
                  <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                    <rect x="6" y="6" width="12" height="12" />
                  </svg>
                </button>
              ) : (
                <button
                  onClick={sendMessage}
                  disabled={!input.trim()}
                  title="Send"
                  className="shrink-0 h-9 w-9 flex items-center justify-center rounded-xl bg-gradient-brand text-white hover:brightness-110 transition-all disabled:opacity-40 disabled:cursor-not-allowed shine"
                >
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth={2.5} viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
                  </svg>
                </button>
              )}
            </div>
            <p className="mt-1.5 text-center text-[10px] text-muted-foreground">
              Answers are based on the SpecSmart product database only.
            </p>
          </div>
        </div>
      )}
    </>
  );
}
