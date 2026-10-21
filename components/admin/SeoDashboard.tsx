"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import type { GoogleAnalyticsSnapshot } from "@/lib/analytics/google";
import type { AnalyticsSummary } from "@/lib/analytics/summary";
import { checklistItems } from "@/lib/seo-system/checklist";
import { PROGRAM, WEEKLY_JOB } from "@/lib/seo-system/program";
import type { KeywordPerformance, SeoStore } from "@/lib/seo-system/types";

export function SeoDashboard({
  allowed,
  store,
  analytics,
  google,
  search,
  nextUpdate,
  week,
}: {
  allowed: boolean;
  store: SeoStore | null;
  analytics: AnalyticsSummary | null;
  google: GoogleAnalyticsSnapshot | null;
  search: { configured: boolean; note: string; rows: KeywordPerformance[] } | null;
  nextUpdate: string;
  week: number;
}) {
  const router = useRouter();
  const [secret, setSecret] = useState("");
  const [error, setError] = useState("");
  const [pending, setPending] = useState(false);
  const [question, setQuestion] = useState("");
  const [asking, setAsking] = useState(false);
  const [chat, setChat] = useState<Array<{ role: "user" | "assistant"; content: string }>>([]);

  async function login(event: React.FormEvent) {
    event.preventDefault();
    setError("");
    const res = await fetch("/api/seo/session", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ secret }),
    });
    if (!res.ok) {
      setError("That PIN was not accepted.");
      return;
    }
    window.location.reload();
  }

  async function act(id: string, action: "approve" | "reject" | "rollback") {
    setPending(true);
    setError("");
    const res = await fetch("/api/seo/changes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id, action }),
    });
    setPending(false);
    if (!res.ok) {
      const body = (await res.json().catch(() => null)) as { error?: string } | null;
      setError(body?.error || "Could not update that change.");
      return;
    }
    window.location.reload();
  }

  if (!allowed || !store || !analytics || !google || !search) {
    return (
      <section className="mx-auto max-w-xl px-6 py-24">
        <h1 className="font-display text-4xl uppercase">King Auto admin</h1>
        <p className="mt-4 text-neutral-400">
          Enter the lot PIN. A wrong PIN stays on this screen. A session that is already open skips it.
        </p>
        <form onSubmit={login} className="mt-8 space-y-4">
          <label className="block text-sm text-neutral-300">
            PIN
            <input
              type="password"
              inputMode="numeric"
              autoComplete="off"
              value={secret}
              onChange={(event) => setSecret(event.target.value)}
              className="mt-2 w-full rounded-lg border border-white/15 bg-black px-3 py-3 tracking-[0.3em]"
            />
          </label>
          <button
            type="submit"
            className="rounded-lg bg-king-red px-4 py-3 text-sm font-semibold"
          >
            Open dashboard
          </button>
          {error && <p className="text-sm text-king-red">{error}</p>}
        </form>
      </section>
    );
  }

  const report = store.reports[store.reports.length - 1];
  const waiting = store.changes.filter((item) => item.status === "pending");
  const handled = store.changes.filter((item) => item.status === "applied");
  const makes = report?.inventory.byMake || [];
  const models = report?.inventory.byModel || [];

  return (
    <div className="mx-auto max-w-6xl px-6 py-16">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-king-gold">King Auto Inc. · Aurora, CO 80014</p>
          <h1 className="mt-2 font-display text-4xl uppercase sm:text-5xl">Lot admin</h1>
          <p className="mt-2 text-sm text-neutral-400">Next SEO update: {nextUpdate} (Denver time)</p>
        </div>
        <div className="flex items-center gap-4">
        <button
          type="button"
          disabled={pending}
          className="rounded-lg bg-king-red px-4 py-2 text-sm font-semibold disabled:opacity-60"
          onClick={async () => {
            setPending(true);
            setError("");
            const res = await fetch("/api/seo/run", { method: "POST" });
            setPending(false);
            if (!res.ok) {
              const body = (await res.json().catch(() => null)) as { error?: string } | null;
              setError(body?.error || "Scan did not finish.");
              return;
            }
            window.location.reload();
          }}
        >
          {pending ? "Working…" : "Do the safe half"}
        </button>
        <button
          type="button"
          disabled={pending}
          className="rounded-lg border border-white/20 px-4 py-2 text-sm font-semibold disabled:opacity-60"
          onClick={async () => {
            setPending(true);
            setError("");
            const res = await fetch("/api/seo/publish", { method: "POST" });
            setPending(false);
            const body = (await res.json().catch(() => null)) as { error?: string } | null;
            if (!res.ok) {
              setError(body?.error || "The live site was not updated.");
              return;
            }
            setError("");
            setChat((current) => [
              ...current,
              { role: "assistant", content: "Vercel is deploying the live site." },
            ]);
          }}
        >
          Publish to live site
        </button>
        <button
          type="button"
          className="text-sm text-neutral-400 underline"
          onClick={async () => {
            await fetch("/api/seo/session", { method: "DELETE" });
            window.location.reload();
          }}
        >
          Sign out
        </button>
        </div>
      </header>
      {error && <p className="mt-4 text-sm text-king-red">{error}</p>}

      <section className="mt-10 rounded-xl border border-white/10 p-5">
        <h2 className="text-xl font-semibold">Ask about the lot</h2>
        <p className="mt-2 text-sm text-neutral-400">
          Answers use the live Dealr list, this server’s visitor counts, and the last SEO scan. Google search clicks stay blank until Search Console is connected. Say “run the SEO scan” to refresh the score.
        </p>
        <div className="mt-4 space-y-3">
          {chat.map((item, index) => (
            <p
              key={`${item.role}-${index}`}
              className={`whitespace-pre-wrap text-sm ${item.role === "user" ? "text-white" : "text-neutral-300"}`}
            >
              <span className="mr-2 text-xs uppercase tracking-wide text-king-gold">
                {item.role === "user" ? "You" : "Admin"}
              </span>
              {item.content}
            </p>
          ))}
          {chat.length === 0 && (
            <p className="text-sm text-neutral-500">
              Try “Which cars are on the lot right now?” or “What is waiting for approval?”
            </p>
          )}
        </div>
        <form
          className="mt-4 flex flex-col gap-3 sm:flex-row"
          onSubmit={async (event) => {
            event.preventDefault();
            const text = question.trim();
            if (!text || asking) return;
            setQuestion("");
            setAsking(true);
            setError("");
            const history = chat.slice(-8);
            setChat((current) => [...current, { role: "user", content: text }]);
            const res = await fetch("/api/seo/ask", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ message: text, history }),
            });
            const body = (await res.json().catch(() => null)) as {
              answer?: string;
              error?: string;
              scanNote?: string;
            } | null;
            setAsking(false);
            if (!res.ok || !body?.answer) {
              setError(body?.error || "The assistant did not answer.");
              return;
            }
            setChat((current) => [...current, { role: "assistant", content: body.answer || "" }]);
            if (body.scanNote && !/failed|already in progress/i.test(body.scanNote)) {
              router.refresh();
            }
          }}
        >
          <input
            value={question}
            onChange={(event) => setQuestion(event.target.value)}
            placeholder="Ask about the lot, the score, or a scan"
            className="min-h-11 flex-1 rounded-lg border border-white/15 bg-black px-3 text-sm"
          />
          <button
            type="submit"
            disabled={asking}
            className="rounded-lg bg-king-gold px-4 py-2 text-sm font-semibold text-black disabled:opacity-60"
          >
            {asking ? "Checking…" : "Ask"}
          </button>
        </form>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="rounded-xl border border-white/10 p-5">
          <h2 className="text-xl font-semibold">We do this</h2>
          <p className="mt-2 text-sm text-neutral-400">
            This half runs from the live Dealr lot. It does not touch your Google Business Profile.
          </p>
          <ul className="mt-4 list-disc space-y-2 pl-5 text-sm text-neutral-200">
            <li>Each car on the Dealr page gets its own page with the year, make, model, price, and Aurora, CO 80014.</li>
            <li>The sitemap and those pages refresh when the lot changes, including when a car is removed.</li>
            <li>A blank description is filled on the next scan. A title change waits for you.</li>
            <li>Every Monday the scan records new cars, sold cars, and price changes.</li>
          </ul>
          {handled.length > 0 && (
            <ul className="mt-4 space-y-2 text-sm text-neutral-300">
              {handled.slice(-6).map((change) => (
                <li key={change.id}>Filled {change.path}: {change.after}</li>
              ))}
            </ul>
          )}
        </div>
        <div className="rounded-xl border border-king-gold/40 p-5">
          <h2 className="text-xl font-semibold">You do this</h2>
          <p className="mt-2 text-sm text-neutral-400">
            Approve the page edits below. The rest happens in Google, not in this website.
          </p>
          <ul className="mt-4 space-y-4">
            {waiting.map((change) => (
              <li key={change.id} className="rounded-lg border border-white/10 p-3 text-sm">
                <p className="font-medium text-white">
                  {change.field === "title" ? "Approve this title" : "Review this change"} · {change.path}
                </p>
                <p className="mt-1 text-neutral-400">{change.reason}</p>
                <p className="mt-2 text-neutral-500">Now: {change.before}</p>
                <p className="mt-1">Next: {change.after}</p>
                <div className="mt-3 flex gap-2">
                  <button type="button" disabled={pending} onClick={() => act(change.id, "approve")} className="rounded-md bg-king-gold px-3 py-2 text-black">
                    Approve
                  </button>
                  <button type="button" disabled={pending} onClick={() => act(change.id, "reject")} className="rounded-md border border-white/20 px-3 py-2">
                    Leave it
                  </button>
                </div>
              </li>
            ))}
            {waiting.length === 0 && (
              <li className="text-sm text-neutral-400">No page edits are waiting. Hit “Do the safe half” after the lot changes.</li>
            )}
          </ul>
          <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm text-neutral-200">
            <li>On the Google Business Profile, keep the name King Auto Inc., the address 2180 S Havana St, Aurora, CO 80014, the phone (303) 502-3022, and hours Mon–Sat 10:00–6:00.</li>
            <li>Ask people who bought a car to leave a Google review on that profile.</li>
            <li>Send the Google Analytics measurement ID and property ID when you have them. This page will then show Google’s numbers.</li>
          </ol>
        </div>
      </section>

      <WeeklyChecklist
        week={week}
        done={store.checklist || {}}
        scannedWeeks={store.runs
          .filter((run) => run.status === "completed" || run.status === "completed_not_persisted")
          .map((run) => run.week)}
        onToggle={async (id, checked) => {
          setPending(true);
          setError("");
          const res = await fetch("/api/seo/checklist", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ id, done: checked }),
          });
          setPending(false);
          if (!res.ok) {
            const body = (await res.json().catch(() => null)) as { error?: string } | null;
            setError(body?.error || "Could not save that check.");
            return;
          }
          router.refresh();
        }}
      />

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Google</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400">
          The page-quality number below is how complete our pages are. Google does not use that number as a rank. First place for King Auto, or for dealerships in Aurora, is Google’s choice. The map listing, reviews, and the same 2180 S Havana St details matter as much as these pages.
        </p>
        <p className="mt-3 text-sm text-neutral-300">{google.note}</p>
        {google.connected && google.today && google.days7 && google.days28 && (
          <div className="mt-4 grid gap-4 sm:grid-cols-3">
            <Stat label="Google today · people" value={String(google.today.users)} />
            <Stat label="Google today · views" value={String(google.today.views)} />
            <Stat label="Google today · sessions" value={String(google.today.sessions)} />
            <Stat label="Google 7 days · people" value={String(google.days7.users)} />
            <Stat label="Google 7 days · views" value={String(google.days7.views)} />
            <Stat label="Google 7 days · sessions" value={String(google.days7.sessions)} />
            <Stat label="Google 28 days · people" value={String(google.days28.users)} />
            <Stat label="Google 28 days · views" value={String(google.days28.views)} />
            <Stat label="Google 28 days · sessions" value={String(google.days28.sessions)} />
          </div>
        )}
        {google.topPages.length > 0 && (
          <ul className="mt-4 space-y-2 text-sm">
            {google.topPages.map((page) => (
              <li key={page.path} className="flex justify-between gap-4 border-b border-white/10 py-2">
                <span className="truncate text-neutral-200">{page.path}</span>
                <span className="shrink-0 text-neutral-400">{page.views} views · {page.users} people</span>
              </li>
            ))}
          </ul>
        )}
        <h3 className="mt-6 text-sm font-semibold uppercase tracking-wide text-neutral-400">Search results</h3>
        <p className="mt-2 text-sm text-neutral-300">{search.note}</p>
        {search.rows.length > 0 && (
          <ul className="mt-3 space-y-2 text-sm">
            {search.rows.slice(0, 8).map((row) => (
              <li key={`${row.query}-${row.page || ""}`} className="flex justify-between gap-4 border-b border-white/10 py-2">
                <span className="truncate text-neutral-200">{row.query}</span>
                <span className="shrink-0 text-neutral-400">
                  {row.clicks} clicks · position {row.position.toFixed(1)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Visitors on this server</h2>
        <p className="mt-2 text-sm text-neutral-400">
          These counts are recorded by this website. They are not Google Analytics, and older traffic is not filled in.
        </p>
        <div className="mt-4 grid gap-4 sm:grid-cols-3">
          <Stat label="Today · people" value={String(analytics.today.visitors)} />
          <Stat label="Today · page views" value={String(analytics.today.views)} />
          <Stat label="Today · taps" value={String(analytics.today.clicks)} />
          <Stat label="7 days · people" value={String(analytics.days7.visitors)} />
          <Stat label="7 days · page views" value={String(analytics.days7.views)} />
          <Stat label="7 days · taps" value={String(analytics.days7.clicks)} />
          <Stat label="30 days · people" value={String(analytics.days30.visitors)} />
          <Stat label="30 days · page views" value={String(analytics.days30.views)} />
          <Stat label="30 days · taps" value={String(analytics.days30.clicks)} />
        </div>
        <div className="mt-6 grid gap-8 lg:grid-cols-2">
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">Top pages · 30 days</h3>
            {analytics.topPages.length === 0 && <p className="mt-3 text-sm text-neutral-500">No page views yet.</p>}
            <ul className="mt-3 space-y-2 text-sm">
              {analytics.topPages.map((page) => (
                <li key={page.path} className="flex justify-between gap-4 border-b border-white/10 py-2">
                  <span className="truncate text-neutral-200">{page.path}</span>
                  <span className="shrink-0 text-neutral-400">{page.views} views · {page.clicks} taps</span>
                </li>
              ))}
            </ul>
          </div>
          <div>
            <h3 className="text-sm font-semibold uppercase tracking-wide text-neutral-400">What people tapped · 30 days</h3>
            {analytics.topClicks.length === 0 && <p className="mt-3 text-sm text-neutral-500">No taps yet.</p>}
            <ul className="mt-3 space-y-2 text-sm">
              {analytics.topClicks.map((tap) => (
                <li key={tap.label} className="flex justify-between gap-4 border-b border-white/10 py-2">
                  <span className="truncate text-neutral-200">{tap.label}</span>
                  <span className="shrink-0 text-neutral-400">{tap.count}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat label="Page quality" value={report ? String(report.scores.overall) : "—"} />
        <Stat label="Active vehicles" value={report ? String(report.inventory.active) : "—"} />
        <Stat label="Pending changes" value={String(store.changes.filter((item) => item.status === "pending").length)} />
        <Stat label="Program week" value={report ? `${report.week} · ${report.theme}` : "Not started"} />
      </section>

      {report && (
        <section className="mt-8 grid gap-4 sm:grid-cols-3 lg:grid-cols-6">
          <Stat label="Technical" value={String(report.scores.technical)} />
          <Stat label="Content" value={String(report.scores.content)} />
          <Stat label="Inventory" value={String(report.scores.inventory)} />
          <Stat label="Local" value={String(report.scores.local)} />
          <Stat label="Indexing" value={String(report.scores.indexing)} />
          <Stat label="Performance" value={report.scores.performance == null ? "Not measured" : String(report.scores.performance)} />
        </section>
      )}

      <section className="mt-10">
        <h2 className="text-xl font-semibold">What runs every Monday</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400">
          Next run: {nextUpdate} Denver time. The same checks run every week. The week theme below is what to review, not a different robot.
          The health score is page quality on this site. It is not a Google ranking, and this job cannot set the site to number one.
        </p>
        <ol className="mt-4 space-y-3 text-sm">
          {WEEKLY_JOB.map((item, index) => (
            <li key={item.step} className="rounded-lg border border-white/10 px-4 py-3">
              <p className="font-medium text-white">{index + 1}. {item.step}</p>
              <p className="mt-1 text-neutral-400">{item.effect}</p>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">26-week plan</h2>
        <p className="mt-2 max-w-3xl text-sm text-neutral-400">
          Week {week} is the current review. Searching “King Auto” depends on the name, address, and phone matching everywhere, including the Google Business Profile.
          “Dealerships in Aurora” is mostly the map pack: that profile, reviews, and the same 2180 S Havana St listing. The website supports that. It does not control it.
        </p>
        <ol className="mt-4 space-y-2">
          {PROGRAM.map((item) => {
            const current = item.week === week;
            return (
              <li
                key={item.week}
                className={`rounded-lg border px-4 py-3 text-sm ${current ? "border-king-gold bg-white/5" : "border-white/10"}`}
              >
                <p className="font-medium text-white">
                  Week {item.week} · {item.theme}
                  {current ? " · this week" : ""}
                </p>
                <p className="mt-1 text-neutral-300">{item.focus}</p>
                <p className="mt-1 text-neutral-500">Effect: {item.effect}</p>
              </li>
            );
          })}
        </ol>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Latest report</h2>
        {!report && (
          <p className="mt-3 text-neutral-400">
            No weekly run is stored yet. The Monday job calls <code>/api/seo/run</code>.
          </p>
        )}
        {report && (
          <div className="mt-4 space-y-3 text-sm text-neutral-300">
            <p>
              {report.rangeStart} to {report.rangeEnd}. Active {report.inventory.active}, new {report.inventory.added}, sold {report.inventory.sold}, price changes {report.inventory.priceChanges}.
            </p>
            <p>{report.search.note}</p>
            {report.search.connected && (
              <p>
                Clicks {report.search.clicks}, impressions {report.search.impressions}, CTR{" "}
                {((report.search.ctr || 0) * 100).toFixed(1)}%, average position{" "}
                {report.search.position?.toFixed(1)}.
              </p>
            )}
            <ul className="list-disc pl-5">
              {report.work.map((line) => (
                <li key={line}>{line}</li>
              ))}
            </ul>
          </div>
        )}
      </section>

      <section className="mt-10 grid gap-8 lg:grid-cols-2">
        <CountList title="Inventory by make" rows={makes} />
        <CountList title="Inventory by model" rows={models.slice(0, 12)} />
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Opportunities</h2>
        <ul className="mt-4 space-y-3">
          {(report?.opportunities || []).map((item) => (
            <li key={item.title} className="rounded-xl border border-white/10 p-4">
              <p className="font-medium">{item.title}</p>
              <p className="mt-1 text-sm text-neutral-400">
                {item.priority} · score {item.score}. {item.detail}
              </p>
            </li>
          ))}
          {!report?.opportunities.length && (
            <li className="text-sm text-neutral-400">Opportunities appear after a run with live inventory.</li>
          )}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Change log</h2>
        <ul className="mt-4 space-y-3">
          {store.changes.slice(-30).reverse().map((change) => (
            <li key={change.id} className="rounded-xl border border-white/10 p-4 text-sm">
              <p className="text-neutral-400">
                {change.status} · {change.risk} risk · {change.path}
              </p>
              <p className="mt-2 text-neutral-500">Current: {change.before}</p>
              <p className="mt-1">Proposed: {change.after}</p>
              <p className="mt-2 text-neutral-400">{change.reason}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {change.status === "pending" && (
                  <>
                    <button type="button" disabled={pending} onClick={() => act(change.id, "approve")} className="rounded-md bg-king-gold px-3 py-2 text-black">
                      Approve
                    </button>
                    <button type="button" disabled={pending} onClick={() => act(change.id, "reject")} className="rounded-md border border-white/20 px-3 py-2">
                      Reject
                    </button>
                  </>
                )}
                {change.status === "applied" && (
                  <button type="button" disabled={pending} onClick={() => act(change.id, "rollback")} className="rounded-md border border-white/20 px-3 py-2">
                    Roll back
                  </button>
                )}
              </div>
            </li>
          ))}
          {store.changes.length === 0 && <li className="text-sm text-neutral-400">No stored changes.</li>}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold">Runs</h2>
        <ul className="mt-4 space-y-2 text-sm text-neutral-300">
          {store.runs.slice(-8).reverse().map((run) => (
            <li key={run.id}>
              Week {run.week} {run.theme}: {run.status}, {run.vehiclesScanned} vehicles, {run.changesQueued} queued, persistence {run.persistence}.
              {(run.notes || []).map((note) => (
                <span key={note} className="block text-neutral-500">{note}</span>
              ))}
              {(run.errors || []).map((note) => (
                <span key={note} className="block text-king-red">{note}</span>
              ))}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function WeeklyChecklist({
  week,
  done,
  scannedWeeks,
  onToggle,
}: {
  week: number;
  done: Record<string, string>;
  scannedWeeks: number[];
  onToggle: (id: string, checked: boolean) => void;
}) {
  const items = checklistItems();
  return (
    <section className="mt-10">
      <h2 className="text-xl font-semibold">Every week from now</h2>
      <p className="mt-2 max-w-3xl text-sm text-neutral-400">
        Week {week} is this week. The site rows check themselves after that week’s scan. Check your rows when the work is done. Finishing the list keeps the site consistent. It does not set a Google rank.
      </p>
      <div className="mt-4 space-y-3">
        {PROGRAM.map((programWeek) => {
          const rows = items.filter((item) => item.week === programWeek.week);
          const finished = rows.filter((item) =>
            item.owner === "site" ? scannedWeeks.includes(item.week) : Boolean(done[item.id])
          ).length;
          return (
            <details
              key={programWeek.week}
              open={programWeek.week === week}
              className={`rounded-xl border px-4 py-3 ${programWeek.week === week ? "border-king-gold" : "border-white/10"}`}
            >
              <summary className="cursor-pointer text-sm font-medium">
                Week {programWeek.week} · {programWeek.theme} · {finished}/{rows.length}
                {programWeek.week === week ? " · this week" : ""}
              </summary>
              <ul className="mt-3 space-y-2">
                {rows.map((item) => {
                  const checked = item.owner === "site" ? scannedWeeks.includes(item.week) : Boolean(done[item.id]);
                  return (
                    <li key={item.id} className="flex items-start gap-3 text-sm">
                      <input
                        type="checkbox"
                        className="mt-1"
                        checked={checked}
                        disabled={item.owner === "site"}
                        onChange={(event) => onToggle(item.id, event.target.checked)}
                      />
                      <span className={checked ? "text-neutral-500" : "text-neutral-100"}>
                        {item.owner === "site" ? "Site · " : "You · "}
                        {item.text}
                      </span>
                    </li>
                  );
                })}
              </ul>
            </details>
          );
        })}
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-white/10 p-4">
      <p className="text-xs uppercase tracking-wider text-neutral-500">{label}</p>
      <p className="mt-2 text-2xl font-semibold">{value}</p>
    </div>
  );
}

function CountList({ title, rows }: { title: string; rows: Array<{ name: string; count: number }> }) {
  return (
    <div>
      <h2 className="text-xl font-semibold">{title}</h2>
      <ul className="mt-4 space-y-2 text-sm text-neutral-300">
        {rows.map((row) => (
          <li key={row.name} className="flex justify-between border-b border-white/10 py-2">
            <span>{row.name}</span>
            <span>{row.count}</span>
          </li>
        ))}
        {rows.length === 0 && <li className="text-neutral-500">No scan yet.</li>}
      </ul>
    </div>
  );
}
