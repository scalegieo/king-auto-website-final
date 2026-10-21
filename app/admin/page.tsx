import type { Metadata } from "next";
import { cookies } from "next/headers";
import { SeoDashboard } from "@/components/admin/SeoDashboard";
import { fetchGoogleAnalytics } from "@/lib/analytics/google";
import { analyticsSummary } from "@/lib/analytics/store";
import { ADMIN_COOKIE, cookieIsAdmin } from "@/lib/seo-system/auth";
import { programWeek } from "@/lib/seo-system/program";
import { formatDenver, nextSeoRun } from "@/lib/seo-system/schedule";
import { fetchSearchConsole } from "@/lib/seo-system/search-console";
import { loadStore } from "@/lib/seo-system/store";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const allowed = cookieIsAdmin(cookies().get(ADMIN_COOKIE)?.value);
  const store = allowed ? await loadStore() : null;
  const analytics = allowed ? await analyticsSummary() : null;
  const google = allowed ? await fetchGoogleAnalytics() : null;
  const search = allowed ? await fetchSearchConsole(new Date()) : null;

  return (
    <main className="min-h-screen bg-black text-white">
      <SeoDashboard
        allowed={allowed}
        store={store}
        analytics={analytics}
        google={google}
        search={search}
        nextUpdate={formatDenver(nextSeoRun())}
        week={programWeek(store?.programStartedAt ?? null, new Date())}
      />
    </main>
  );
}
