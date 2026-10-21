import { PROGRAM } from "./program";

export type ChecklistItem = {
  id: string;
  week: number;
  owner: "site" | "you";
  text: string;
};

const YOU: Record<number, string[]> = {
  1: [
    "Confirm the Google Business Profile says King Auto Inc., 2180 S Havana St, Aurora, CO 80014, (303) 502-3022, Mon–Sat 10:00–6:00.",
    "Approve or leave the title changes in You do this.",
    "Ask one recent buyer to leave a Google review on that profile.",
  ],
  2: [
    "Add https://www.shopkingauto.com/ in Google Search Console if it is not there.",
    "Open the live /robots.txt and /sitemap.xml and confirm car pages are listed.",
  ],
  3: [
    "Open three car pages and confirm each shows the year, make, model, and Aurora, CO 80014.",
    "Confirm each car has one page on shopkingauto.com.",
  ],
  4: [
    "Approve any weak titles the scan queued. Leave a title that is already clear.",
    "Check that a car removed on Dealr is gone after a refresh.",
  ],
  5: [
    "Open one car page source and confirm the price and address match the car, with no fake rating.",
  ],
  6: [
    "From a car page, follow More on the lot and Financing. Both should be real pages on this site.",
  ],
  7: [
    "Read the homepage and a car page. The lot city is Aurora. Denver is only the metro around it.",
  ],
  8: [
    "If a make has at least four cars, approve or leave the category idea. Do not add a page for one car.",
  ],
  9: [
    "Look at the model with the most cars in stock and approve only a change tied to those cars.",
  ],
  10: [
    "Open a car photo and confirm the description names that car and Aurora.",
  ],
  11: [
    "If Search Console is connected, review a title people saw and did not click. If it is not connected, skip this.",
  ],
  12: [
    "Compare this week’s page-quality score with week 1. Leave pages that are already clear.",
  ],
  13: [
    "Read new cars, sold cars, and price changes before changing any page.",
  ],
  14: [
    "Work the top opportunity in the list. Skip ideas that are not backed by cars in stock.",
  ],
  15: [
    "If a model sold down, stop treating it as a priority.",
  ],
  16: [
    "Confirm related cars on a page are still for sale.",
  ],
  17: [
    "Note one gap versus another Aurora dealer. Do not copy their inventory or pages.",
  ],
  18: [
    "If Search Console shows a query around positions 11–20, review that page. Otherwise skip.",
  ],
  19: [
    "If a query dropped, read the page before rewriting it.",
  ],
  20: [
    "Approve a title only when Search Console shows impressions and few clicks.",
  ],
  21: [
    "Leave or reject a category idea that no longer has four cars.",
  ],
  22: [
    "Recheck two car pages. Skip any page that already reads clearly.",
  ],
  23: [
    "Recheck the Google Business Profile against 2180 S Havana St, (303) 502-3022, and Mon–Sat 10–6.",
  ],
  24: [
    "Open /robots.txt, /sitemap.xml, and one car page on the live site again.",
  ],
  25: [
    "Approve only leftover items that name a real car or a real Search Console query.",
  ],
  26: [
    "Read the six-month report: what sold, what is new, and which pages still need a decision.",
    "Ask for another Google review from a buyer this month.",
  ],
};

export function checklistItems(): ChecklistItem[] {
  const items: ChecklistItem[] = [];
  for (const week of PROGRAM) {
    items.push({
      id: `w${week.week}-scan`,
      week: week.week,
      owner: "site",
      text: `Scan the lot for ${week.theme}. Missing descriptions are filled. Titles wait for approval.`,
    });
    for (const [index, text] of (YOU[week.week] || []).entries()) {
      items.push({
        id: `w${week.week}-you-${index}`,
        week: week.week,
        owner: "you",
        text,
      });
    }
  }
  return items;
}

export function checklistItem(id: string): ChecklistItem | undefined {
  return checklistItems().find((item) => item.id === id);
}
