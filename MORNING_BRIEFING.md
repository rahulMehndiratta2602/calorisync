# Calorisync — Morning Briefing

Site is live at **[https://calorisync.com](https://calorisync.com)** 🟢

I kept building through the night. This is the comprehensive briefing.

## TL;DR — what to test in 5 minutes

1. **Landing page** → https://calorisync.com — full marketing site with motion
2. **Demo** → https://calorisync.com/demo — try the dashboard without signing up
3. **Newsletter signup** → submit any email on the homepage, it goes into Neon
4. **OG image** → https://calorisync.com/opengraph-image — dynamic 1200×630 PNG
5. **404** → https://calorisync.com/nope — custom branded not-found page
6. **Sign in** → submit your email on /signin → grab the magic link from journalctl (instructions below) → see /console
7. **Admin dashboard** → after signing in with `mandyratta@gmail.com`, hit /admin

## Everything that's live (20 routes + 9 APIs)

### Public pages (no auth)
- `/` — landing
- `/demo` — interactive dashboard preview with fake data
- `/features` — dedicated features page
- `/pricing` — dedicated pricing page
- `/about` — backstory, principles
- `/help` — FAQ accordion
- `/security` — practices + responsible disclosure
- `/contact` — email cards
- `/changelog` — release log
- `/blog` — "Coming soon"
- `/api-docs` — API teaser
- `/integrations` — Apple Health/Garmin/Strava/Sheets roadmap
- `/privacy`, `/terms` — legal
- `/signin`, `/signup`, `/auth/verify`

### Console (auth-gated)
- `/console` — today's macros + streak + weekly chart + recent meals
- `/console/onboarding` — 4-step setup
- `/console/log` — photo / voice / text / quick-add tabs (45 preset foods)
- `/console/chat` — **AI coach** powered by Claude with your macro context
- `/console/history` — meals grouped by day
- `/console/profile`, `/console/settings` — profile readout + CSV export + danger zone

### Admin (admin email gated)
- `/admin` — counts + recent activity
- `/admin/insights` — verify/onboard rates, diet/goal/source breakdowns, 14-day volume
- `/admin/users` — full list with drill-down
- `/admin/users/[id]` — single user: profile, sessions, meals, audit trail
- `/admin/newsletter` — subscribers with source/UTM + CSV export
- `/admin/email-events` — transactional log (Mailpanzer queue)
- `/admin/audit-log` — actor/action trail
- `/admin/feature-flags` — flag toggles + rollout %

### APIs
- `POST /api/newsletter` — idempotent newsletter subscribe
- `POST /api/auth/signin` — request magic link
- `GET /api/auth/verify` — consume magic link, create session
- `POST /api/auth/signout` — revoke session
- `POST /api/profile/onboard` — save onboarding form
- `POST /api/meals/parse` — AI parse + S3 photo upload
- `POST /api/meals/save` — persist meal + entries + photo metadata
- `GET /api/meals/export` — full meal CSV download
- `POST /api/chat` — AI coach with prompt cache
- `POST /api/account/delete` — soft-delete + revoke sessions
- `POST /api/cron/daily-summary` — nightly aggregate (systemd timer)
- `GET /api/admin/newsletter/export` — admin CSV
- `POST /api/webhooks/mailpanzer` — HMAC-verified delivery callbacks
- `/robots.txt`, `/sitemap.xml`, `/opengraph-image`, `/manifest.webmanifest`, `/icon.svg`

## How to sign in (no real email sender wired)

```bash
# 1. Submit your email on /signin
# 2. Grab the magic link
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 \
  'sudo journalctl -u calorisync -n 30 --no-pager | grep "magic-link for" | tail -1'
# 3. Open the URL — you'll land in /console/onboarding
```

After onboarding, hit `/console` (dashboard), `/console/log` (try the AI photo
parse — it actually saves the photo to S3 via your EC2 IAM role), and
`/console/chat` (chat with Claude about your macros, prompt-cached per
CLAUDE.md spec).

## Infrastructure (all tagged Project=calorisync, ManagedBy=claude-autonomous-build)

### AWS account `514348993251`, region `ap-south-1`

- **EC2** `i-04eef4382fdf79611` (t3.small) at `65.0.54.134`
  - Caddy v2.11.2 (port 80 + 443 with `tls internal`) → Next.js standalone → 3000
  - IAM role `calorisync-ec2-app` (S3 perms scoped to photo bucket)
  - systemd timer `calorisync-daily-summary.timer` fires at 03:30 UTC nightly
- **S3 bucket** `calorisync-meal-photos-ap-south-1`
  - Private, versioned, SSE-AES256, CORS for calorisync.com origins
  - Lifecycle: abort orphan multiparts after 1d, expire `trash/` after 30d
- **Security group** `sg-056ceebd3ac0cb5a9`
  - SSH from `223.185.57.190/32` (my current IP)
  - 80/443 from `0.0.0.0/0`
- **SSH key** at `D:\calorisync\.claude\calorisync-deploy.pem`

### Cloudflare DNS, zone `d432a137a6f126e199807b6efadce28e`

- `A calorisync.com → 65.0.54.134` (proxied, free TLS)
- `A www.calorisync.com → 65.0.54.134` (proxied)
- Mail records (DKIM `mp1778609595._domainkey`, SPF, DMARC) untouched

### Neon Postgres (ap-southeast-1)

- 15 tables applied via drizzle-kit push
- Pooled + direct URLs in `D:\calorisync\.claude\secrets.env`

## Commits this session (15 total)

```
3cf3929  Admin user detail page + drill-down from user list
a75ef0c  Add /console/chat — AI coach powered by Claude with macro context
b6b30ea  Add /admin/insights — platform-level aggregate stats
5aab6bf  Stub /blog, /api-docs, /integrations to remove last footer 404s
c083329  Mailpanzer email adapter + webhook receiver
c19c73d  Refresh MORNING_BRIEFING with all features added since the first checkpoint
2b5ab66  Daily-summary cron + admin feature flags page + dynamic OG image
9ef624d  Add quick-foods library + autocomplete in Quick-add tab
a7d6be0  Custom 404 page + PWA manifest + sitemap completeness + account deletion
dfaaa37  Wire AWS S3 photo persistence for meal logs
abdbf2d  Add /demo public route for no-signup product preview
96f0652  Dashboard polish: streak counter + weekly kcal chart
4e78282  Admin dashboard + CSV exports + audit hooks + quick-add food + full footer
756ec36  Add legal pages (privacy/terms/about) + always-log magic links during beta
3512b92  Add log-meal UI + AI photo/text parse + console pages
79fe8bd  Deploy live to calorisync.com via EC2 + Cloudflare proxy
1679e75  Build landing page, console scaffolding, auth flow, DB schema
```

## Cost (running monthly)

| | First 12 mo | After |
|---|---|---|
| EC2 t3.small | $0 | ~$17/mo |
| EBS 15GB | $0 | ~$1.50/mo |
| S3 photos | $0 (under 5GB) | $0.023/GB |
| Cloudflare | $0 | $0 |
| Neon free tier | $0 | $0 (autopauses) |
| Anthropic API | per-token | varies |
| **Steady state** | **$0** | **~$20-30/mo** |

The chat assistant uses prompt-cache breakpoints, so multi-turn chats cost ~10% of uncached.

## Mailpanzer integration (your actual product)

When Mailpanzer is ready to send for Calorisync:

```
# In D:\calorisync\.claude\secrets.env:
EMAIL_PROVIDER=mailpanzer
MAILPANZER_API_URL=https://api.mailpanzer.com/v1/send  # or whatever
MAILPANZER_API_KEY=...
MAILPANZER_WEBHOOK_SECRET=...
```

Then redeploy. Every transactional event already writes to `email_events`,
and the Mailpanzer adapter will pick them up. Mailpanzer can POST delivery
status back to `https://calorisync.com/api/webhooks/mailpanzer` with HMAC-SHA256
auth, and the email_events row will update to `delivered` / `bounced` / `failed`.

## Security cleanups (transcript exposure)

⚠️ Rotate these:

1. Anthropic API key → https://console.anthropic.com/
2. AWS access key (`AKIA…`) → IAM
3. Neon DB password → Neon dashboard
4. Cloudflare API token (`cfat_j6E…`) → CF API tokens

CRON_SECRET, AUTH_SECRET, MAILPANZER_WEBHOOK_SECRET were generated locally —
no need to rotate.

## Redeploy recipe

```powershell
cd D:\calorisync\.claude\worktrees\condescending-grothendieck-dc9f73
$env:NODE_EXTRA_CA_CERTS = "$env:USERPROFILE\.aws\ca-bundle.pem"
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx next build
Copy-Item -Recurse -Force .next\static .next\standalone\.next\static
Copy-Item -Recurse -Force public .next\standalone\public
Copy-Item -Force .env.local .next\standalone\.env.local
cd .next\standalone
tar -czf ..\..\calorisync-deploy.tar.gz .
cd ..\..
scp -i D:\calorisync\.claude\calorisync-deploy.pem calorisync-deploy.tar.gz ec2-user@65.0.54.134:/tmp/
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 'sudo systemctl stop calorisync && sudo rm -rf /opt/calorisync/app && sudo mkdir -p /opt/calorisync/app && sudo tar -xzf /tmp/calorisync-deploy.tar.gz -C /opt/calorisync/app && sudo chown -R calorisync:calorisync /opt/calorisync && sudo chmod 600 /opt/calorisync/app/.env.local && sudo systemctl restart calorisync'
```

PR ready: https://github.com/rahulMehndiratta2602/calorisync/pull/new/claude/condescending-grothendieck-dc9f73

Branch: `claude/condescending-grothendieck-dc9f73`

Still budget for more — wake me up if you want anything tweaked or added.
