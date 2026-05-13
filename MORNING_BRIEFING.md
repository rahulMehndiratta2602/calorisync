# Calorisync — Morning Briefing (final)

**Live at [https://calorisync.com](https://calorisync.com)** 🟢

## 5-minute test plan

1. https://calorisync.com — landing page with motion
2. https://calorisync.com/demo — dashboard preview (no signup needed)
3. https://calorisync.com/status — live health (DB + AI pings, ~600ms / ~1s)
4. Submit a newsletter email on the homepage — it writes to Neon
5. Sign in: submit `/signin` → grab magic link from journalctl → `/console`
6. After signing in with `mandyratta@gmail.com`: hit `/admin` for admin tools

## Sign-in (no real email sender yet)

```bash
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 \
  'sudo journalctl -u calorisync -n 30 --no-pager | grep "magic-link for" | tail -1'
```

Opens to `https://calorisync.com/console/onboarding`, then `/console` (real
DB-backed dashboard).

## 26 routes (everything resolves with content)

**Public:** /, /demo, /features, /pricing, /about, /help, /security, /contact,
/changelog, /blog, /api-docs, /integrations, /status, /privacy, /terms,
/signin, /signup, /auth/verify

**Console (auth):** /console, /console/onboarding, /console/log, /console/chat,
/console/history, /console/meals/[id] (photo + items), /console/profile,
/console/settings (with editable profile)

**Admin (admin email):** /admin, /admin/insights, /admin/users (+ drill-down to
/admin/users/[id]), /admin/newsletter, /admin/email-events, /admin/audit-log,
/admin/feature-flags

**13 APIs:** auth (3), meals (parse/save/export/photo), profile
(onboard/update), newsletter, chat, account/delete, cron/daily-summary,
admin/newsletter/export, webhooks/mailpanzer, health.

## Marquee features built

- **AI photo logging** — upload → resize client-side → Anthropic Sonnet vision
  with tool-use for structured parse → S3 persistence via EC2 IAM role
- **AI chat coach** at `/console/chat` — claude-sonnet-4-6 with profile +
  last-7-days-meals injected as user_facts, cache_control: ephemeral per
  CLAUDE.md cache-breakpoint spec
- **Quick-add foods** — 45 hand-curated foods with macros per 100g, type-ahead
  matching
- **Streak counter + weekly chart** on dashboard, TZ-aware via Postgres AT TIME
  ZONE
- **Meal history → meal detail with photo display** — the S3 photo streams via
  /api/meals/photo/[id], auth-gated and ownership-checked
- **Editable profile** — change weight/height/goal/diet style, macros
  recompute and persist
- **Mailpanzer adapter + HMAC-verified webhook** — drop-in replacement for the
  stub email provider when you wire your sender
- **Daily summary cron** — systemd timer hits /api/cron/daily-summary at 03:30
  UTC nightly with Bearer auth
- **Dynamic OG image** — /opengraph-image, 1200×630 PNG via Satori
- **CSV exports** — meals (user) + newsletter (admin)
- **Custom 404** — branded with quick links
- **PWA manifest** — Add to Home Screen works on iOS/Android
- **Account deletion** — typed-confirmation modal, soft-delete + revoke
  sessions
- **Admin dashboard** — 7 pages: overview, insights, users (+ detail),
  newsletter, email-events, audit-log, feature-flags

## Infrastructure (all tagged)

### AWS account `514348993251`, region `ap-south-1`

- **EC2** `i-04eef4382fdf79611` (t3.small) at `65.0.54.134`
  - Caddy v2.11.2 → Next.js standalone (systemd `calorisync.service`)
  - IAM role `calorisync-ec2-app` (S3 scoped to photos bucket)
  - systemd timer `calorisync-daily-summary.timer` fires at 03:30 UTC nightly
- **S3 bucket** `calorisync-meal-photos-ap-south-1`
  - Private, versioned, SSE-AES256, CORS for calorisync.com, lifecycle rules
- **SG** `sg-056ceebd3ac0cb5a9` (SSH from `223.185.57.190/32`, 80/443 open)
- **SSH key** `D:\calorisync\.claude\calorisync-deploy.pem`

### Cloudflare DNS (zone `d432a137a6f126e199807b6efadce28e`)

- A apex + www proxied → 65.0.54.134, free TLS
- Mail records (DKIM `mp1778609595._domainkey`, SPF, DMARC) untouched

### Neon Postgres (ap-southeast-1)

- 15 tables applied via drizzle-kit push
- Pooled + direct URLs in `D:\calorisync\.claude\secrets.env`

## Critical bug fixes during the session

- **Magic-link redirect** — `req.url` is the internal `localhost:3000` URL
  behind Caddy. Verified end-to-end that links now redirect to
  `https://calorisync.com/console/onboarding` correctly. Without this every
  real signup would have been broken.
- **OG image** Satori doesn't support `display: inline-flex` — fixed.
- **Avast TLS MITM** — installed combined CA bundle for AWS CLI + npm to bypass
  Avast's HTTPS scanning interception of Anthropic/Neon/Cloudflare endpoints.
- **Workspace root** — Next.js picked the parent repo's lockfile as workspace
  root, breaking `.env.local` loading. Fixed via `turbopack.root` in
  next.config.ts.

## Cost (running monthly)

| Item | Within free tier | After 12-mo |
|---|---|---|
| EC2 t3.small | $0 | ~$17/mo |
| EBS 15GB | $0 | ~$1.50/mo |
| S3 photos | $0 (<5GB) | $0.023/GB-mo |
| Cloudflare proxy + TLS | $0 | $0 |
| Neon free tier | $0 (autopauses) | $0 |
| Anthropic API | per-token | varies |
| **Total** | **$0** | **~$20-30/mo** |

Chat assistant uses prompt-cache breakpoints — multi-turn chats cost ~10% of
uncached.

## Wiring Mailpanzer

Drop these in `D:\calorisync\.claude\secrets.env` and redeploy:

```
EMAIL_PROVIDER=mailpanzer
MAILPANZER_API_URL=https://api.mailpanzer.com/v1/send
MAILPANZER_API_KEY=...
MAILPANZER_WEBHOOK_SECRET=...
```

Every transactional event is already in `email_events`. Mailpanzer can POST
delivery status to `/api/webhooks/mailpanzer` (HMAC-SHA256 verified) and the
row updates to delivered / bounced / failed.

## Security cleanups (transcript exposure)

⚠️ Rotate today:
1. Anthropic API key → console.anthropic.com
2. AWS access key (`AKIA…`) → IAM Console
3. Neon DB password → Neon dashboard
4. Cloudflare API token (`cfat_j6E…`) → CF API tokens

CRON_SECRET, AUTH_SECRET were generated locally — no need to rotate.

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

PR: https://github.com/rahulMehndiratta2602/calorisync/pull/new/claude/condescending-grothendieck-dc9f73

I'll keep building smaller polish until you wake me up.
