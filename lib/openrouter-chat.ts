/**
 * OpenRouter free-model chat with daily caps + model cooldown rotation.
 * Only models with $0 pricing / `:free` (or openrouter/free) are used.
 */

import { promises as fs } from "fs";
import path from "path";
import { DEALERSHIP } from "@/lib/dealership";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS_URL = "https://openrouter.ai/api/v1/models";

/**
 * Chat config. API key must come from env (GitHub push protection blocks
 * committing OpenRouter keys). Set OPENROUTER_API_KEY in .env.local / Vercel.
 */
const HARDCODED = {
  monthlyRequestBudget: 1500,
  dailyRequestLimit: 0, // 0 = use monthly ÷ days
  tz: "America/Denver",
  siteUrl: "https://www.mykingautoinc.com",
  appName: DEALERSHIP.name,
} as const;

function getOpenRouterApiKey(): string {
  return (process.env.OPENROUTER_API_KEY || "").trim();
}

/** Always prefer the free router, then known free chat models as fallbacks. */
const SEED_FREE_MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "meta-llama/llama-3.2-3b-instruct:free",
  "google/gemma-2-9b-it:free",
  "mistralai/mistral-7b-instruct:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "microsoft/phi-3-mini-128k-instruct:free",
  "huggingfaceh4/zephyr-7b-beta:free",
];

type DayState = {
  date: string; // YYYY-MM-DD (America/Denver-ish via server local)
  requests: number;
  /** modelId -> unix ms when cooldown expires */
  cooldowns: Record<string, number>;
  lastModel?: string;
};

const STATE_DIR = path.join(process.cwd(), ".data");
const STATE_FILE = path.join(STATE_DIR, "openrouter-chat.json");

let memoryState: DayState | null = null;
let cachedFreeModels: { ids: string[]; fetchedAt: number } | null = null;

function todayKey() {
  return new Intl.DateTimeFormat("en-CA", {
    timeZone: HARDCODED.tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(new Date());
}

function daysInThisMonth() {
  const now = new Date(
    new Date().toLocaleString("en-US", {
      timeZone: HARDCODED.tz,
    })
  );
  return new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
}

/** Split monthly request budget evenly across days in the month. */
export function getDailyRequestLimit(): number {
  if (HARDCODED.dailyRequestLimit > 0) return HARDCODED.dailyRequestLimit;
  const monthly = HARDCODED.monthlyRequestBudget;
  if (monthly <= 0) return 50;
  return Math.max(1, Math.floor(monthly / daysInThisMonth()));
}

async function loadState(): Promise<DayState> {
  const date = todayKey();
  if (memoryState?.date === date) return memoryState;

  try {
    const raw = await fs.readFile(STATE_FILE, "utf8");
    const parsed = JSON.parse(raw) as DayState;
    if (parsed.date === date) {
      memoryState = {
        date: parsed.date,
        requests: parsed.requests || 0,
        cooldowns: parsed.cooldowns || {},
        lastModel: parsed.lastModel,
      };
      return memoryState;
    }
  } catch {
    /* fresh day / no file */
  }

  memoryState = { date, requests: 0, cooldowns: {} };
  return memoryState;
}

async function saveState(state: DayState) {
  memoryState = state;
  try {
    await fs.mkdir(STATE_DIR, { recursive: true });
    await fs.writeFile(STATE_FILE, JSON.stringify(state, null, 2), "utf8");
  } catch {
    /* serverless FS may be read-only — memory still works for the instance */
  }
}

function isZeroPrice(model: {
  id?: string;
  pricing?: { prompt?: string; completion?: string };
}) {
  const id = model.id || "";
  if (id === "openrouter/free" || id.endsWith(":free")) return true;
  const p = model.pricing?.prompt;
  const c = model.pricing?.completion;
  return p === "0" && c === "0";
}

async function listFreeModelIds(apiKey: string): Promise<string[]> {
  const now = Date.now();
  if (cachedFreeModels && now - cachedFreeModels.fetchedAt < 6 * 60 * 60 * 1000) {
    return cachedFreeModels.ids;
  }

  try {
    const res = await fetch(MODELS_URL, {
      headers: { Authorization: `Bearer ${apiKey}` },
      next: { revalidate: 21600 },
    });
    if (res.ok) {
      const json = (await res.json()) as {
        data?: Array<{
          id: string;
          pricing?: { prompt?: string; completion?: string };
        }>;
      };
      const free = (json.data || [])
        .filter(isZeroPrice)
        .map((m) => m.id)
        .filter(
          (id) =>
            !/embed|tts|rerank|whisper|moderation|safety|guard|classifier/i.test(
              id
            )
        );

      const ordered = [
        "openrouter/free",
        ...SEED_FREE_MODELS.filter((id) => id !== "openrouter/free"),
        ...free,
      ];
      const unique = Array.from(new Set(ordered));
      cachedFreeModels = { ids: unique, fetchedAt: now };
      return unique;
    }
  } catch {
    /* fall through to seeds */
  }

  cachedFreeModels = { ids: SEED_FREE_MODELS, fetchedAt: now };
  return SEED_FREE_MODELS;
}

function isRateLimitedError(status: number, body: string) {
  const b = body.toLowerCase();
  return (
    status === 429 ||
    status === 402 ||
    /rate.?limit|usage.?limit|banned|quota|insufficient|free.?tier|daily.?limit|too many requests|temporarily/.test(
      b
    )
  );
}

function endOfDayMs() {
  const tz = HARDCODED.tz;
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: tz,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());
  const y = parts.find((p) => p.type === "year")!.value;
  const m = parts.find((p) => p.type === "month")!.value;
  const d = parts.find((p) => p.type === "day")!.value;
  // Approximate: midnight Denver next day as UTC+7 worst-case + 24h from now is fine for cooldown
  const tomorrow = new Date(`${y}-${m}-${d}T23:59:59`);
  return tomorrow.getTime() + 60_000;
}

const SYSTEM_PROMPT = `You are the ${DEALERSHIP.name} dealership assistant on Havana Street in Aurora, CO (Denver metro).
Dealership: ${DEALERSHIP.name}, ${DEALERSHIP.addressLine1}, ${DEALERSHIP.addressLine2}. Phone ${DEALERSHIP.phoneDisplay} / ${DEALERSHIP.phoneSchema}. Email ${DEALERSHIP.email}.
Hours: Monday–Saturday 10am–6pm. Sunday closed.
Google Maps: ${DEALERSHIP.name} listing on Havana St (use Visit Us / Get Directions on the site).
Help with: live inventory (on this site), financing / pre-approval, hours, location, visiting the lot, contacting the team.
Be concise, friendly, and premium — black/red/gold dealership tone. Do not invent specific vehicle prices or VINs; point shoppers to the live inventory section.
If they want cars/trucks/SUVs, say you'll send them to Inventory. If financing, to the financing form. If hours/map, to Visit Us.
Keep answers under ~80 words unless they ask for detail.`;

export type ChatResult =
  | {
      ok: true;
      message: string;
      model: string;
      dailyRemaining: number;
      dailyLimit: number;
    }
  | {
      ok: false;
      error: string;
      code: "daily_limit" | "no_models" | "config" | "upstream";
      dailyRemaining?: number;
      dailyLimit?: number;
    };

export async function chatWithFreeModels(params: {
  messages: Array<{ role: "user" | "assistant" | "system"; content: string }>;
}): Promise<ChatResult> {
  const apiKey = getOpenRouterApiKey();
  if (!apiKey) {
    return {
      ok: false,
      code: "config",
      error: "AI chat is not configured. Missing OpenRouter API key.",
    };
  }

  const dailyLimit = getDailyRequestLimit();
  const state = await loadState();

  if (state.requests >= dailyLimit) {
    return {
      ok: false,
      code: "daily_limit",
      error: `Daily AI limit reached (${dailyLimit} messages today). Free capacity resets tomorrow — please call ${DEALERSHIP.phoneDisplay} or try again then.`,
      dailyRemaining: 0,
      dailyLimit,
    };
  }

  const models = await listFreeModelIds(apiKey);
  const now = Date.now();
  const available = models.filter((id) => (state.cooldowns[id] || 0) < now);

  if (available.length === 0) {
    return {
      ok: false,
      code: "no_models",
      error:
        "All free AI models are rate-limited for today. Please try again tomorrow or call " +
        DEALERSHIP.phoneDisplay +
        ".",
      dailyRemaining: Math.max(0, dailyLimit - state.requests),
      dailyLimit,
    };
  }

  const payloadMessages = [
    { role: "system" as const, content: SYSTEM_PROMPT },
    ...params.messages.filter((m) => m.role !== "system").slice(-12),
  ];

  let lastError = "All free models failed.";

  for (const model of available) {
    try {
      const res = await fetch(OPENROUTER_URL, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "Content-Type": "application/json",
          "HTTP-Referer": HARDCODED.siteUrl,
          "X-Title": HARDCODED.appName,
        },
        body: JSON.stringify({
          model,
          messages: payloadMessages,
          temperature: 0.5,
          max_tokens: 400,
        }),
      });

      const raw = await res.text();
      let json: {
        choices?: Array<{ message?: { content?: string } }>;
        error?: { message?: string };
      } = {};
      try {
        json = JSON.parse(raw) as typeof json;
      } catch {
        /* non-json */
      }

      if (!res.ok) {
        lastError = json.error?.message || raw.slice(0, 200) || `HTTP ${res.status}`;
        if (isRateLimitedError(res.status, raw)) {
          state.cooldowns[model] = endOfDayMs();
          await saveState(state);
          continue;
        }
        // Non-rate errors: try next free model too
        state.cooldowns[model] = now + 15 * 60 * 1000;
        await saveState(state);
        continue;
      }

      const content = json.choices?.[0]?.message?.content?.trim();
      if (!content) {
        lastError = "Empty response from model.";
        continue;
      }

      // Skip garbage / safety-classifier style replies from free router
      if (
        content.length < 12 ||
        /^user safety:/i.test(content) ||
        /^(safe|unsafe)\.?$/i.test(content)
      ) {
        lastError = "Unusable free-model reply; trying next.";
        state.cooldowns[model] = now + 2 * 60 * 1000;
        await saveState(state);
        continue;
      }

      state.requests += 1;
      state.lastModel = model;
      await saveState(state);

      return {
        ok: true,
        message: content,
        model,
        dailyRemaining: Math.max(0, dailyLimit - state.requests),
        dailyLimit,
      };
    } catch (err) {
      lastError = err instanceof Error ? err.message : "Network error";
      state.cooldowns[model] = now + 5 * 60 * 1000;
      await saveState(state);
    }
  }

  return {
    ok: false,
    code: "upstream",
    error: `Free AI models are unavailable right now (${lastError}). Please try again shortly or call ${DEALERSHIP.phoneDisplay}.`,
    dailyRemaining: Math.max(0, dailyLimit - state.requests),
    dailyLimit,
  };
}
