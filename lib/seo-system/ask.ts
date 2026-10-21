import "server-only";

import { DEALERSHIP } from "@/lib/dealership";
import { fetchLiveInventory } from "@/lib/inventory/fetch";
import { analyticsSummary } from "@/lib/analytics/store";
import { getOpenRouterApiKey } from "@/lib/openrouter-chat";
import { formatDenver, nextSeoRun } from "./schedule";
import { loadStore } from "./store";
import type { SeoStore } from "./types";

const OPENROUTER_URL = "https://openrouter.ai/api/v1/chat/completions";
const MODELS = [
  "openrouter/free",
  "meta-llama/llama-3.3-70b-instruct:free",
  "google/gemma-2-9b-it:free",
  "qwen/qwen-2.5-7b-instruct:free",
  "mistralai/mistral-7b-instruct:free",
];

export function wantsSeoScan(message: string): boolean {
  return (
    /\b(run|start|refresh|rerun)\b[\s\S]{0,48}\b(scan|seo|audit)\b/i.test(message) ||
    /\bscan (the )?(site|lot|seo|pages)\b/i.test(message)
  );
}

export async function answerAdminQuestion(input: {
  message: string;
  history: Array<{ role: "user" | "assistant"; content: string }>;
  scanNote?: string;
}): Promise<{ ok: true; answer: string } | { ok: false; error: string }> {
  const store = await loadStore();
  const analytics = await analyticsSummary();
  let liveNote = "The live Dealr page could not be read just now.";
  try {
    const live = await fetchLiveInventory();
    const lines = live.slice(0, 40).map((vehicle) => {
      const name = [vehicle.year, vehicle.make, vehicle.model, vehicle.trim]
        .filter(Boolean)
        .join(" ");
      return `${name}${vehicle.stockNumber ? ` stock ${vehicle.stockNumber}` : ""}`;
    });
    liveNote = `Live Dealr lot right now: ${live.length} vehicles.\n${lines.join("\n")}`;
  } catch {
    /* keep the note */
  }

  const key = getOpenRouterApiKey();
  if (!key) {
    return { ok: false, error: "No OpenRouter API key is set on the server." };
  }

  const messages = [
    { role: "system" as const, content: systemPrompt(store, analytics, liveNote, input.scanNote) },
    ...input.history.slice(-8).map((item) => ({
      role: item.role,
      content: item.content.slice(0, 2000),
    })),
    { role: "user" as const, content: input.message.slice(0, 2000) },
  ];

  let lastError = "No model answered.";
  for (const model of MODELS) {
    const res = await fetch(OPENROUTER_URL, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${key}`,
        "Content-Type": "application/json",
        "HTTP-Referer": "https://www.shopkingauto.com",
        "X-Title": "King Auto admin",
      },
      body: JSON.stringify({
        model,
        messages,
        temperature: 0.2,
        max_tokens: 700,
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
      json = {};
    }
    if (!res.ok) {
      lastError = json.error?.message || `OpenRouter returned HTTP ${res.status}.`;
      continue;
    }
    const answer = json.choices?.[0]?.message?.content?.trim() || "";
    if (!answer || answer.length < 12 || /^user safety:/i.test(answer)) {
      lastError = "That model did not return a usable answer.";
      continue;
    }
    return { ok: true, answer };
  }
  return { ok: false, error: lastError };
}

function systemPrompt(
  store: SeoStore,
  analytics: Awaited<ReturnType<typeof analyticsSummary>>,
  liveNote: string,
  scanNote?: string
): string {
  const report = store.reports[store.reports.length - 1];
  const changes = store.changes.slice(-12).map((change) => ({
    status: change.status,
    risk: change.risk,
    path: change.path,
    before: change.before,
    after: change.after,
    reason: change.reason,
  }));
  const facts = {
    dealership: {
      name: DEALERSHIP.name,
      address: `${DEALERSHIP.addressLine1}, ${DEALERSHIP.addressLine2}`,
      phone: DEALERSHIP.phoneDisplay,
    },
    nextSeoUpdateDenver: formatDenver(nextSeoRun()),
    scanNote: scanNote || "No scan was started for this question.",
    pageQualityScore: report
      ? report.scores
      : "No scan is stored yet. Do not invent a score.",
    latestReport: report
      ? {
          week: report.week,
          theme: report.theme,
          inventory: report.inventory,
          search: report.search,
          work: report.work,
        }
      : null,
    searchConsole: store.searchNote,
    pendingChanges: changes.filter((change) => change.status === "pending"),
    recentChanges: changes,
    visitors: analytics,
    liveLot: liveNote,
  };

  return [
    "You are the private admin assistant for King Auto Inc. in Aurora, CO.",
    "Use only the facts below. If a number is missing, say it is not measured.",
    "The page-quality score is not a Google ranking. Never say the site is number 1, and never invent clicks, impressions, or positions.",
    "Search Console numbers exist only when search.connected is true.",
    "Visitor counts start when this site's own tracker went live. They are not Google Analytics history.",
    "You cannot approve, reject, or publish a page change. Tell the user to use the Approve or Reject buttons.",
    "A removed car disappears from the site only after it is gone from the live Dealr lot listed below.",
    scanNote ? `Scan result for this question: ${scanNote}` : "",
    JSON.stringify(facts),
  ]
    .filter(Boolean)
    .join("\n");
}
