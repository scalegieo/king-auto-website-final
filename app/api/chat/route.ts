import { NextResponse } from "next/server";
import { chatWithFreeModels } from "@/lib/openrouter-chat";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

type IncomingMsg = { role: "user" | "assistant"; text?: string; content?: string };

function navigateHint(userText: string): string | undefined {
  const q = userText.toLowerCase();
  if (/inventor|car|vehicle|truck|suv|stock|lot|price|cost/.test(q)) {
    return "inventory";
  }
  if (/financ|loan|credit|approv|payment|pre-?approv/.test(q)) {
    return "financing";
  }
  if (/hour|open|close|address|locat|direct|map|visit|where|havana|aurora|denver/.test(q)) {
    return "visit";
  }
  if (/about|who|lounge|story/.test(q)) return "about";
  return undefined;
}

export async function POST(req: Request) {
  let body: { messages?: IncomingMsg[]; message?: string };
  try {
    body = (await req.json()) as typeof body;
  } catch {
    return NextResponse.json({ ok: false, error: "Invalid JSON." }, { status: 400 });
  }

  const messages = (body.messages || [])
    .map((m) => ({
      role: m.role,
      content: (m.content || m.text || "").trim(),
    }))
    .filter((m) => m.content.length > 0 && (m.role === "user" || m.role === "assistant"));

  if (body.message?.trim()) {
    messages.push({ role: "user", content: body.message.trim() });
  }

  if (messages.length === 0) {
    return NextResponse.json(
      { ok: false, error: "Message required." },
      { status: 400 }
    );
  }

  const lastUser = [...messages].reverse().find((m) => m.role === "user");
  const result = await chatWithFreeModels({ messages });

  if (!result.ok) {
    const status =
      result.code === "daily_limit"
        ? 429
        : result.code === "config"
          ? 503
          : result.code === "no_models"
            ? 503
            : 502;
    return NextResponse.json(
      {
        ok: false,
        error: result.error,
        code: result.code,
        dailyRemaining: result.dailyRemaining,
        dailyLimit: result.dailyLimit,
      },
      { status }
    );
  }

  return NextResponse.json({
    ok: true,
    message: result.message,
    model: result.model,
    navigate: lastUser ? navigateHint(lastUser.content) : undefined,
    dailyRemaining: result.dailyRemaining,
    dailyLimit: result.dailyLimit,
  });
}
