export type ProgramWeek = {
  week: number;
  theme: string;
  focus: string;
  effect: string;
};

/** Priorities for the human review. The Monday job still runs the same checks every week. */
export const PROGRAM: ProgramWeek[] = [
  {
    week: 1,
    theme: "Baseline",
    focus: "Record the live lot and current page quality. Do not rewrite pages that are already clear.",
    effect: "Saves the cars that are actually for sale. Shopper pages stay as they are.",
  },
  {
    week: 2,
    theme: "Technical SEO",
    focus: "Fix crawl, canonical, robots, and sitemap gaps that are deterministic.",
    effect: "Flags broken crawl files. It does not redesign the site.",
  },
  {
    week: 3,
    theme: "Inventory architecture",
    focus: "Confirm every active vehicle has one indexable URL.",
    effect: "Checks that each car has one page. It does not invent extra URLs.",
  },
  {
    week: 4,
    theme: "Vehicle metadata",
    focus: "Queue weak titles. Fill only missing descriptions.",
    effect: "A blank description can be filled. A title change waits for your approval.",
  },
  {
    week: 5,
    theme: "Vehicle schema",
    focus: "Check structured data against the fields actually on the page.",
    effect: "Schema stays tied to real price, miles, and the Aurora address. No fake ratings.",
  },
  {
    week: 6,
    theme: "Internal linking",
    focus: "Connect vehicles to inventory, financing, and similar cars on the lot.",
    effect: "Suggests links between cars that are on the lot. It does not add links to other dealers.",
  },
  {
    week: 7,
    theme: "Local SEO",
    focus: "Keep Aurora, CO 80014 and Havana Street accurate. Do not add a Denver address.",
    effect: "Keeps the lot at 2180 S Havana St. Denver stays the metro, not a second address.",
  },
  {
    week: 8,
    theme: "Inventory categories",
    focus: "Recommend a category only when several of that vehicle are in stock.",
    effect: "A category idea needs at least four cars. The page is not created until you approve it.",
  },
  {
    week: 9,
    theme: "Make and model opportunities",
    focus: "Raise attention where the same model is concentrated.",
    effect: "Prioritizes models you actually have several of, such as a few Chargers.",
  },
  {
    week: 10,
    theme: "Image SEO",
    focus: "Alt text should name the real vehicle and the Aurora lot.",
    effect: "Image text names the car and Aurora. It does not add stock photos of cars you do not have.",
  },
  {
    week: 11,
    theme: "CTR",
    focus: "Review titles only where Search Console shows impressions without clicks.",
    effect: "Looks at titles only when Search Console shows people saw a page and did not click. No data means no change.",
  },
  {
    week: 12,
    theme: "Midpoint audit",
    focus: "Compare this week with the baseline. Leave winners alone.",
    effect: "Compares the score with week 1. Pages that are already clear are left alone.",
  },
  {
    week: 13,
    theme: "Results",
    focus: "Read movement before changing anything.",
    effect: "Reads what changed in stock and search before any rewrite.",
  },
  {
    week: 14,
    theme: "Highest-potential pages",
    focus: "Work the best inventory-backed opportunities first.",
    effect: "Puts the strongest real inventory pages at the top of the review list.",
  },
  {
    week: 15,
    theme: "Inventory-driven SEO",
    focus: "Follow stock. A model that sold down should not stay a priority.",
    effect: "Drops a model from the priority list after those cars sell.",
  },
  {
    week: 16,
    theme: "Internal links",
    focus: "Add only links between related, available vehicles.",
    effect: "Links only cars that are still for sale.",
  },
  {
    week: 17,
    theme: "Competitors",
    focus: "Note gaps. Do not copy another dealer or invent inventory.",
    effect: "Notes gaps. It does not copy another dealer’s cars or pages.",
  },
  {
    week: 18,
    theme: "Page-two queries",
    focus: "If Search Console shows positions 11–20, queue a careful review.",
    effect: "Queues a review only if Search Console shows a query on page two.",
  },
  {
    week: 19,
    theme: "Declining queries",
    focus: "Investigate drops before rewriting.",
    effect: "Looks at a drop before changing the page that used to get the click.",
  },
  {
    week: 20,
    theme: "High impression, low CTR",
    focus: "Title and description reviews only, and only with data.",
    effect: "Title edits stay in the change log until you approve them.",
  },
  {
    week: 21,
    theme: "Category refinement",
    focus: "Drop category ideas that no longer have enough cars.",
    effect: "Removes a category idea when fewer than four of those cars remain.",
  },
  {
    week: 22,
    theme: "Vehicle page refinement",
    focus: "Re-check thin vehicle pages. Skip pages that already read clearly.",
    effect: "Rechecks thin car pages. Clear pages are skipped.",
  },
  {
    week: 23,
    theme: "Local refinement",
    focus: "Address, phone, and hours still match the Havana Street lot.",
    effect: "Rechecks 2180 S Havana St, (303) 502-3022, and Mon–Sat 10–6.",
  },
  {
    week: 24,
    theme: "Technical re-audit",
    focus: "Re-check robots, sitemap, and indexability.",
    effect: "Rechecks robots.txt, the sitemap, and whether car pages can be indexed.",
  },
  {
    week: 25,
    theme: "Final pass",
    focus: "Only remaining high-confidence items.",
    effect: "Only leftover items that are backed by the feed or Search Console.",
  },
  {
    week: 26,
    theme: "Six-month report",
    focus: "Summarize what changed in inventory and search. Plan the next cycle from the data.",
    effect: "Writes the six-month report. The next cycle starts from that data, not from a guess.",
  },
];

export const WEEKLY_JOB: Array<{ step: string; effect: string }> = [
  {
    step: "Pull the live Dealr inventory.",
    effect: "If the feed is empty, the job stops. Cars are not marked sold.",
  },
  {
    step: "Compare this week with the last snapshot.",
    effect: "You see new cars, sold cars, and price changes. Shopper pages do not move.",
  },
  {
    step: "Check the homepage, inventory, and every car page.",
    effect: "Looks at the title, description, heading, canonical, and schema against the real car.",
  },
  {
    step: "Open the live site’s homepage, robots.txt, sitemap, and inventory.",
    effect: "Confirms Google can find the public pages. Admin stays blocked.",
  },
  {
    step: "Read Search Console when it is connected.",
    effect: "Clicks, impressions, and position stay blank until that connection exists. They are not estimated.",
  },
  {
    step: "Score page quality.",
    effect: "The score is how complete our pages are. It is not a Google rank.",
  },
  {
    step: "Apply only a missing description. Queue everything else.",
    effect: "Titles, redirects, and new pages wait in the change log until you approve them.",
  },
];

export function programWeek(startedAt: string | null, now: Date): number {
  if (!startedAt) return 1;
  const elapsed = now.getTime() - new Date(startedAt).getTime();
  const weeks = Math.floor(elapsed / (7 * 24 * 60 * 60 * 1000));
  return Math.min(26, Math.max(1, weeks + 1));
}

export function themeForWeek(week: number): ProgramWeek {
  return PROGRAM[Math.min(26, Math.max(1, week)) - 1];
}
