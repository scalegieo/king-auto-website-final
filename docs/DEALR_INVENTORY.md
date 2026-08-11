# Dealr inventory feed — King Auto Inc.

King Auto’s site loads **active inventory** from a Dealr export (CSV), not from the legacy website DMS UI.

## What to send Dealr (reply to Adam / Dealr support)

**Website vendor:** MediPath AI (Next.js site for King Auto Inc.)

**We can receive inventory via:**

1. **FTP** (preferred once credentials are issued) — we need:
   - Server host
   - Username
   - Password
   - Filename (e.g. `inventory.csv`)

2. **HTTP URL** to a CSV file (if Dealr posts exports to a URL)

Set these in production (Vercel → Environment Variables):

| Variable | Description |
|----------|-------------|
| `DEALR_FTP_HOST` | FTP server hostname |
| `DEALR_FTP_USERNAME` | FTP username |
| `DEALR_FTP_PASSWORD` | FTP password |
| `DEALR_FTP_FILENAME` | Remote CSV filename |
| `DEALR_FTP_SECURE` | `true` for FTPS |
| `DEALR_INVENTORY_URL` | Optional HTTP CSV URL |
| `INVENTORY_REVALIDATE_SECONDS` | Cache refresh (default 300) |

## Plan note (from Dealr email)

- Grow plan may need **Manage → Settings → Feeds** if vendor is already listed.
- Custom one-off FTP may require **Scale 100** upgrade — Sales will confirm billing.

## Development

- Sample file: `data/sample-dealr-inventory.csv`
- Parser: `lib/inventory/dealr-csv.ts` (flexible column names)
- Loader: `lib/inventory/fetch.ts`

Run locally with sample CSV automatically in `development`.

## Manual refresh (optional)

`GET /api/inventory/refresh` with header:

`Authorization: Bearer <INVENTORY_SYNC_SECRET>`

Use for cron jobs after Dealr publishes a new file.

## Column mapping

The parser accepts common headers such as: `Stock`, `VIN`, `Year`, `Make`, `Model`, `Trim`, `Price`, `Mileage`, `Photo`, `Status`.

When Dealr sends their example CSV, compare headers and extend `lib/inventory/dealr-csv.ts` if needed.
