/** Next Monday 15:00 UTC, matching the Vercel cron. */
export function nextSeoRun(now = new Date()): Date {
  for (let i = 0; i < 8; i++) {
    const candidate = new Date(
      Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate() + i, 15, 0, 0)
    );
    if (candidate.getUTCDay() === 1 && candidate.getTime() > now.getTime()) {
      return candidate;
    }
  }
  return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
}

export function formatDenver(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Denver",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}
