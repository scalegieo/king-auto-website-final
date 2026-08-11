# Google Sheets CRM (lead forms)

Forms POST to `/api/leads/car-request` and `/api/leads/quick-match`, which forward JSON to your Google Apps Script web app.

## Environment

Set in **Vercel → Settings → Environment Variables** (and optional `.env.local` for dev):

```bash
GOOGLE_SHEETS_CRM_WEBHOOK=https://script.google.com/macros/s/AKfycby98Zkhgq4O0Sf1ynFMgni9IfTJPFbLO5ImgBMiD3F76GM5IZUfpYlgu-_l_o6almZgsg/exec
```

If `GOOGLE_SHEETS_CRM_WEBHOOK` is set to an **older** deployment URL, Vehicle Match submissions may fail while 60 Second Match still works. Remove the variable or update it to the URL above, then **redeploy** the site.

## Spreadsheet tabs (exact names)

Your Apps Script must write to sheets named exactly:

| Tab name | `formType` |
|----------|------------|
| `Vehicle Match Request` | `vehicle_match` |
| `60 Second Match` | `quick_match` |

If **Vehicle Match Request** submissions fail with `appendRow` on null, the Apps Script tab name is wrong — use **`Vehicle Match Request`** (not `Vehicle Match Requests`), or redeploy the script from `scripts/google-sheets-crm.gs` in this repo.

## Troubleshooting empty sheets but green success on the site

1. **Vercel env** — In **Settings → Environment Variables**, set `GOOGLE_SHEETS_CRM_WEBHOOK` to the URL above (or remove it to use the default in code). An older URL (`AKfycbzVu…`) breaks **Vehicle Match** (`appendRow` on null) and may write **60 Second Match** to a different deployment.
2. **Redeploy Apps Script** after pasting `scripts/google-sheets-crm.gs` (see deploy steps below). The web app must run as **you** with **Anyone** access.
3. **Confirm rows** — Submit a test lead, then refresh the sheet. Test payloads from dev may include emails like `*@test.local`.
4. **Do not test the webhook with `curl -L`** — Google’s redirect can turn POST into GET and return HTML/405. Use the site API or Node `fetch` with `redirect: "follow"`.

## Deploy Apps Script (after editing `google-sheets-crm.gs`)

See `scripts/google-sheets-crm.gs` in this repo.

After editing the script: **Deploy → Manage deployments → Edit → New version → Deploy** (web app, execute as you, **Anyone** can access).
