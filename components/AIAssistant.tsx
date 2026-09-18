"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Car,
  CreditCard,
  Headphones,
  MapPin,
  Phone,
  Send,
  X,
} from "lucide-react";
import { BrandLogo } from "@/components/BrandLogo";
import { DEALERSHIP } from "@/lib/dealership";

type Msg = { role: "user" | "assistant"; text: string };

const QUICK = [
  { label: "Show inventory", action: "inventory" },
  { label: "Get financed", action: "financing" },
  { label: "Hours & location", action: "visit" },
  { label: "Call us", action: "call" },
];

function scrollToId(id: string) {
  document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
}

interface AIAssistantProps {
  onOpenFinancing?: () => void;
}

export function AIAssistant({ onOpenFinancing }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [dailyNote, setDailyNote] = useState<string | null>(null);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      text: "Welcome to King Auto. Ask about inventory, financing, hours, or how to reach our team.",
    },
  ]);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, open]);

  function handleAction(action: string) {
    if (action === "inventory") {
      setOpen(false);
      scrollToId("inventory");
      return;
    }
    if (action === "financing") {
      setOpen(false);
      scrollToId("financing");
      onOpenFinancing?.();
      return;
    }
    if (action === "visit") {
      setOpen(false);
      scrollToId("visit");
      return;
    }
    if (action === "call") {
      window.location.href = `tel:${DEALERSHIP.phoneTel}`;
      return;
    }
  }

  async function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    const nextMessages: Msg[] = [...messages, { role: "user", text: trimmed }];
    setMessages(nextMessages);
    setInput("");
    setBusy(true);
    setDailyNote(null);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: nextMessages.map((m) => ({
            role: m.role,
            content: m.text,
          })),
        }),
      });

      const data = (await res.json()) as {
        ok?: boolean;
        message?: string;
        error?: string;
        code?: string;
        navigate?: string;
        dailyRemaining?: number;
        dailyLimit?: number;
      };

      if (!res.ok || data.ok !== true || !data.message) {
        const err =
          data.error ||
          `I couldn't reach the assistant right now. Call ${DEALERSHIP.phoneDisplay}.`;
        setMessages((m) => [...m, { role: "assistant", text: err }]);
        if (data.code === "daily_limit") {
          setDailyNote(
            data.dailyLimit
              ? `Daily limit: ${data.dailyLimit} free AI messages.`
              : "Daily free AI limit reached."
          );
        }
        return;
      }

      setMessages((m) => [...m, { role: "assistant", text: data.message! }]);
      if (
        typeof data.dailyRemaining === "number" &&
        typeof data.dailyLimit === "number" &&
        data.dailyRemaining <= 5
      ) {
        setDailyNote(
          `${data.dailyRemaining} free AI messages left today (${data.dailyLimit}/day).`
        );
      }

      if (data.navigate) {
        window.setTimeout(() => {
          if (data.navigate === "financing") onOpenFinancing?.();
          scrollToId(data.navigate!);
        }, 450);
      }
    } catch {
      setMessages((m) => [
        ...m,
        {
          role: "assistant",
          text: `Network error — please try again or call ${DEALERSHIP.phoneDisplay}.`,
        },
      ]);
    } finally {
      setBusy(false);
    }
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    void send(input);
  }

  return (
    <>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 12, scale: 0.96 }}
            transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
            className="fixed bottom-[calc(5.5rem+env(safe-area-inset-bottom))] left-3 right-3 sm:left-auto sm:right-6 sm:bottom-24 z-[90] sm:w-[min(100%,380px)] max-h-[min(70dvh,32rem)] flex flex-col overflow-hidden rounded-xl border border-white/15 bg-charcoal-900 shadow-glass"
            role="dialog"
            aria-label="King Auto help"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-charcoal-900/95 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandLogo size="sm" className="max-w-[100px]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Need help?</p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    Free AI · inventory · financing
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="inline-flex min-h-11 min-w-11 shrink-0 items-center justify-center rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 focus-ring"
                aria-label="Close assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-4 py-3 space-y-3">
              {messages.map((msg, i) => (
                <div
                  key={`${msg.role}-${i}`}
                  className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                >
                  <div
                    className={`max-w-[85%] rounded-2xl px-3.5 py-2.5 text-sm leading-relaxed ${
                      msg.role === "user"
                        ? "bg-king-red text-white rounded-br-md"
                        : "bg-white/10 text-neutral-100 rounded-bl-md"
                    }`}
                  >
                    {msg.text}
                  </div>
                </div>
              ))}
              {busy && (
                <p className="text-xs text-neutral-500 pl-1">Thinking…</p>
              )}
              <div ref={bottomRef} />
            </div>

            {dailyNote && (
              <p className="px-4 pb-1 text-[11px] text-king-gold/90">{dailyNote}</p>
            )}

            <div className="px-3 pb-2 flex flex-wrap gap-1.5 shrink-0">
              {QUICK.map((q) => (
                <button
                  key={q.action}
                  type="button"
                  onClick={() => void send(q.label)}
                  className="min-h-9 rounded-full border border-white/15 bg-white/5 px-3 py-1.5 text-[11px] text-neutral-300 hover:border-king-gold hover:text-king-gold transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-white/10 p-3 shrink-0"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cars, financing, hours…"
                className="min-h-11 flex-1 rounded-xl bg-charcoal-950 border border-white/10 px-3 py-2.5 text-base sm:text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-king-red text-white hover:bg-king-red-bright disabled:opacity-40 focus-ring"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex border-t border-white/10 text-[11px] shrink-0">
              <button
                type="button"
                onClick={() => handleAction("inventory")}
                className="flex-1 flex min-h-11 items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold"
              >
                <Car className="w-3.5 h-3.5" /> Inventory
              </button>
              <button
                type="button"
                onClick={() => handleAction("financing")}
                className="flex-1 flex min-h-11 items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold border-x border-white/10"
              >
                <CreditCard className="w-3.5 h-3.5" /> Finance
              </button>
              <button
                type="button"
                onClick={() => handleAction("visit")}
                className="flex-1 flex min-h-11 items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold"
              >
                <MapPin className="w-3.5 h-3.5" /> Visit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-3 sm:right-6 z-[90] flex flex-col items-end gap-2">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="inline-flex h-12 w-12 items-center justify-center rounded-full bg-king-red text-white shadow-red hover:bg-king-red-bright transition-colors focus-ring"
          aria-label={open ? "Close help" : "Open help"}
        >
          {open ? <X className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
        </button>
        <a
          href={`tel:${DEALERSHIP.phoneTel}`}
          className="sm:hidden inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/20 bg-charcoal-950/95 text-king-gold backdrop-blur-sm"
          aria-label="Call King Auto"
        >
          <Phone className="w-4 h-4" />
        </a>
      </div>
    </>
  );
}
