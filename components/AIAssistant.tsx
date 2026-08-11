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

function replyTo(input: string): { text: string; navigate?: string } {
  const q = input.toLowerCase().trim();

  if (/inventor|car|vehicle|truck|suv|stock|lot/.test(q)) {
    return {
      text: "Here's our live inventory — filter by make, price, or year. Tap any vehicle to apply.",
      navigate: "inventory",
    };
  }
  if (/financ|loan|credit|approv|payment|pre-?approv/.test(q)) {
    return {
      text: "We can check financing in about 60 seconds. I'll take you to the form — fill it out and a specialist will follow up.",
      navigate: "financing",
    };
  }
  if (/hour|open|close|when|time/.test(q)) {
    return {
      text: "We're open Mon–Fri 10am–7pm, Sat 10am–6pm, Sunday by appointment. Want directions to Havana St?",
      navigate: "visit",
    };
  }
  if (/address|locat|direct|map|visit|where|havana|aurora|denver/.test(q)) {
    return {
      text: "We're at 2180 S Havana St, Aurora, CO 80014. Parking on site — I'll scroll you to Visit Us for hours and a map link.",
      navigate: "visit",
    };
  }
  if (/call|phone|number|contact/.test(q)) {
    return {
      text: "Call or text us at (303) 502-3022, or email mykingauto@gmail.com. Want me to open the text form?",
    };
  }
  if (/about|who|king auto|story|lounge/.test(q)) {
    return {
      text: "King Auto Inc. is a Havana St dealership focused on transparent pricing, fast financing, and a VIP lounge experience. Scrolling to About.",
      navigate: "about",
    };
  }
  if (/price|cost|how much/.test(q)) {
    return {
      text: "Every vehicle lists a clear price on the inventory grid — no mystery fees. Jumping you there now.",
      navigate: "inventory",
    };
  }
  if (/help|hi|hello|hey|start/.test(q)) {
    return {
      text: "Hey — I'm the King Auto assistant. I can take you to inventory, financing, hours, or help you get in touch. What do you need?",
    };
  }

  return {
    text: "I can help with inventory, financing, hours, location, or contacting the team. Try “show trucks” or “get financed.”",
  };
}

interface AIAssistantProps {
  onOpenFinancing?: () => void;
}

export function AIAssistant({ onOpenFinancing }: AIAssistantProps) {
  const [open, setOpen] = useState(false);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
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
      window.location.href = "tel:3035023022";
      return;
    }
  }

  function send(text: string) {
    const trimmed = text.trim();
    if (!trimmed || busy) return;

    setMessages((m) => [...m, { role: "user", text: trimmed }]);
    setInput("");
    setBusy(true);

    const result = replyTo(trimmed);

    window.setTimeout(() => {
      setMessages((m) => [...m, { role: "assistant", text: result.text }]);
      setBusy(false);
      if (result.navigate) {
        window.setTimeout(() => {
          if (result.navigate === "financing") onOpenFinancing?.();
          scrollToId(result.navigate!);
        }, 400);
      }
      if (/text form|text us/i.test(result.text)) {
        // offer handled in message; user can tap quick action
      }
    }, 450);
  }

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    send(input);
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
            className="fixed bottom-[5.5rem] left-4 right-4 sm:left-auto sm:right-6 sm:bottom-24 z-[90] sm:w-[min(100vw-2rem,380px)] overflow-hidden rounded-xl border border-white/15 bg-charcoal-900 shadow-glass"
            role="dialog"
            aria-label="King Auto help"
          >
            <div className="flex items-center justify-between gap-3 border-b border-white/10 bg-charcoal-900/95 px-4 py-3">
              <div className="flex items-center gap-3 min-w-0">
                <BrandLogo size="sm" className="max-w-[100px]" />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-white">Need help?</p>
                  <p className="text-[11px] text-neutral-400 truncate">
                    Inventory · financing · visit
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="p-1.5 rounded-lg text-neutral-400 hover:text-white hover:bg-white/10 focus-ring"
                aria-label="Close assistant"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="h-[280px] overflow-y-auto px-4 py-3 space-y-3">
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

            <div className="px-3 pb-2 flex flex-wrap gap-1.5">
              {QUICK.map((q) => (
                <button
                  key={q.action}
                  type="button"
                  onClick={() => send(q.label)}
                  className="rounded-full border border-white/15 bg-white/5 px-2.5 py-1 text-[11px] text-neutral-300 hover:border-king-gold hover:text-king-gold transition-colors"
                >
                  {q.label}
                </button>
              ))}
            </div>

            <form
              onSubmit={onSubmit}
              className="flex items-center gap-2 border-t border-white/10 p-3"
            >
              <input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about cars, financing, hours…"
                className="flex-1 rounded-xl bg-charcoal-950 border border-white/10 px-3 py-2.5 text-sm text-white placeholder:text-neutral-500 outline-none focus:border-king-gold"
              />
              <button
                type="submit"
                disabled={busy || !input.trim()}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-king-red text-white hover:bg-king-red-bright disabled:opacity-40 focus-ring"
                aria-label="Send message"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>

            <div className="flex border-t border-white/10 text-[11px]">
              <button
                type="button"
                onClick={() => handleAction("inventory")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold"
              >
                <Car className="w-3.5 h-3.5" /> Inventory
              </button>
              <button
                type="button"
                onClick={() => handleAction("financing")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold border-x border-white/10"
              >
                <CreditCard className="w-3.5 h-3.5" /> Finance
              </button>
              <button
                type="button"
                onClick={() => handleAction("visit")}
                className="flex-1 flex items-center justify-center gap-1.5 py-2.5 text-neutral-400 hover:text-king-gold"
              >
                <MapPin className="w-3.5 h-3.5" /> Visit
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="fixed bottom-5 right-4 sm:right-6 z-[90] flex flex-col items-end gap-2 safe-bottom">
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          className="flex h-12 w-12 items-center justify-center rounded-full bg-king-red text-white shadow-red hover:bg-king-red-bright transition-colors focus-ring"
          aria-label={open ? "Close help" : "Open help"}
        >
          {open ? <X className="w-5 h-5" /> : <Headphones className="w-5 h-5" />}
        </button>
        <a
          href="tel:3035023022"
          className="sm:hidden flex h-11 w-11 items-center justify-center rounded-full border border-white/20 bg-charcoal-950 text-king-gold"
          aria-label="Call King Auto"
        >
          <Phone className="w-5 h-5" />
        </a>
      </div>
    </>
  );
}
