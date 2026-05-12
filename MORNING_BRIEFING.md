# Calorisync — Morning Briefing

Good morning. Site is live at **[https://calorisync.com](https://calorisync.com)** 🟢

## Quick test list (5 minutes)

1. **Landing page** → https://calorisync.com — full hero/features/pricing/FAQ should render with motion animations on scroll.
2. **Newsletter signup** → enter an email on the hero or footer form. Should show "Subscribed. Check your inbox soon." (No email actually sent yet — Mailpanzer is the planned sender. Event was logged to `email_events` table.)
3. **Legal pages** → https://calorisync.com/privacy, /terms, /about — all live.
4. **Signup flow** → Click "Get started" / "Start free" → enter your real email → should show "Check your inbox" screen. (Magic link is logged to EC2 journalctl, not actually emailed — see "How to test signed-in flow" below.)
5. **404s OK for**: /features, /pricing (this is the landing #pricing section — link goes to anchor), /changelog, /blog, /contact, /help, /api-docs, /integrations, /security. These are intentionally not built; just stubbed in footer for future SEO links.

## What's working end-to-end

| Feature | URL | Status |
|---|---|---|
| Landing page | / | ✅ Live, full sections |
| Newsletter signup | /api/newsletter | ✅ Idempotent, DB-backed, emits `newsletter_welcome` event |
| Magic-link auth (request) | /signin, /signup, POST /api/auth/signin | ✅ Generates 30-min single-use link, hashes in DB |
| Magic-link verify | /api/auth/verify?token=... | ✅ Consumes link, creates 90-day session cookie |
| Sign out | POST /api/auth/signout | ✅ Revokes session |
| Onboarding | /console/onboarding | ✅ 4-step form, computes & stores macro targets per CLAUDE.md formula |
| Dashboard | /console | ✅ DB-backed, daily totals + macro rings + recent meals |
| Log meal (UI) | /console/log | ✅ Photo / voice / text tabs |
| AI parse | POST /api/meals/parse | ✅ Anthropic Sonnet 4.6 + tool use, returns items[] + confidence |
| Save meal | POST /api/meals/save | ✅ Transactional insert into `meals` + `meal_entries` |
| History | /console/history | ✅ Grouped by day |
| Settings | /console/settings | ✅ Profile readout + danger zone |
| Privacy / Terms / About | /privacy, /terms, /about | ✅ Real legal copy |
| SEO | /sitemap.xml, /robots.txt | ✅ Both live |
| Structured data | Embedded in `<head>` | ✅ SoftwareApplication schema with pricing offers |

## How to test the signed-in flow manually

The magic link isn't actually emailed (Mailpanzer not built yet — that's the whole reason Calorisync exists, right?). To follow a magic link manually:

```bash
# 1. POST signin (creates link in DB, logs URL to journalctl)
curl -X POST http://calorisync.com/api/auth/signin \
  -H 'content-type: application/json' \
  -d '{"email":"YOU@example.com"}'

# 2. Grab the link from EC2 logs
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 \
  'sudo journalctl -u calorisync -n 50 --no-pager | grep magic-link | tail -1'

# 3. Open the URL it prints in your browser → you'll be redirected to /console
```

Once you've been to `/console/onboarding` and filled the 4-step form, the dashboard is live, and `/console/log` lets you upload a photo / speak / type to log a meal via real AI parsing.

## Infrastructure live

### AWS account `514348993251`, region `ap-south-1`

- **EC2**: `i-04eef4382fdf79611` (t3.small, 2GB RAM, 15 GB gp3 root)
  - Public IP `65.0.54.134` — DNS `ec2-65-0-54-134.ap-south-1.compute.amazonaws.com`
  - Stack: Caddy v2.11.2 reverse proxy → Next.js standalone (systemd `calorisync.service`)
  - All tagged `Project=calorisync, Env=prod, ManagedBy=claude-autonomous-build, Service=web, Owner=rahulmehndiratta2602`
- **Security group**: `sg-056ceebd3ac0cb5a9` (`calorisync-sg`)
  - 22 from `223.185.55.177/32` ← your IP at session-start; **update if you've moved networks**
  - 80, 443 from `0.0.0.0/0`
- **SSH key**: `calorisync-deploy`, private key at `D:\calorisync\.claude\calorisync-deploy.pem`

### Cloudflare DNS, zone `d432a137a6f126e199807b6efadce28e`

- `A calorisync.com → 65.0.54.134` (proxied — free TLS at edge)
- `A www.calorisync.com → 65.0.54.134` (proxied)
- **Untouched (Mailpanzer mail records):** `TXT _dmarc`, `TXT calorisync.com` (SPF), `TXT mp1778609595._domainkey`

### Neon Postgres (ap-southeast-1)

- 15 tables applied via `drizzle-kit push` to project `calorisync`
- Pooled + direct connection strings in `D:\calorisync\.claude\secrets.env` and `.env.local`

### Orphaned infra (cleanup whenever you want)

- CloudFront `E3O07PGHO8L9M5` — was serving the old "Hello World" placeholder; not used anymore
- ACM cert `arn:aws:acm:us-east-1:514348993251:certificate/760f666a-be9e-45d3-b9a6-373f82655cb5` — was for the CloudFront; not used
- Two leftover validation CNAMEs in Cloudflare DNS (`_415a8544...`, `_5ea1f50d...`) — harmless but can be deleted
- S3 bucket `calorisync-website` — only contains the old `index.html`. `calorisync.com` bucket is empty.

## Cost estimate

- EC2 t3.small `ap-south-1`: ~$0.024/hr after free tier expires → ~$17/mo if no free credit. Within new-customer 12-month free tier this is $0.
- EBS 15 GB gp3: ~$1.50/mo
- Neon free tier: $0 (autopauses when idle)
- Cloudflare proxy + TLS: $0
- Anthropic API: per-token (see usage below)
- **Estimated bill if no free credits at all**: ~$20/mo for infra

## What I didn't build / left stubbed

- **Stripe billing** — you said skip. UI shows "Coming soon" badge. Schema (`subscriptions` table) ready.
- **Real email sending** — Mailpanzer handles this; `email_events` table logs every transactional event.
- **Voice via Whisper** — using Web Speech API (browser-native) instead since you don't have OpenAI key. Works in Chrome/Edge/Safari.
- **USDA food DB** — AI estimates macros entirely. Accuracy ~95% per CLAUDE.md prompt; lower for unusual items.
- **AWS S3 photo upload** — photos go through Anthropic and aren't persisted to S3. `meal_photos` table has the schema, but the upload step is skipped (saves cost). Easy to wire later.
- **Footer links** — only /privacy, /terms, /about are live. /features, /blog, etc. 404.
- **Admin features** — `audit_log`, `feature_flags`, `user_role` enum all exist in schema. No admin UI built yet.

## Files / paths reference

- Worktree: `D:\calorisync\.claude\worktrees\condescending-grothendieck-dc9f73`
- Secrets: `D:\calorisync\.claude\secrets.env`
- SSH key: `D:\calorisync\.claude\calorisync-deploy.pem`
- EC2 state JSON: `D:\calorisync\.claude\ec2-state.json`
- CA bundle (Avast workaround): `C:\Users\my\.aws\ca-bundle.pem`
- Progress log: `D:\calorisync\.claude\progress.md`

## How to redeploy

```powershell
cd D:\calorisync\.claude\worktrees\condescending-grothendieck-dc9f73
$env:NODE_EXTRA_CA_CERTS = "$env:USERPROFILE\.aws\ca-bundle.pem"

# Rebuild
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue
npx next build

# Assemble
Copy-Item -Recurse -Force .next\static .next\standalone\.next\static
Copy-Item -Recurse -Force public .next\standalone\public
Copy-Item -Force .env.local .next\standalone\.env.local
cd .next\standalone
tar -czf ..\..\calorisync-deploy.tar.gz .
cd ..\..

# Push + restart on EC2
scp -i D:\calorisync\.claude\calorisync-deploy.pem calorisync-deploy.tar.gz ec2-user@65.0.54.134:/tmp/
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 'sudo systemctl stop calorisync && sudo rm -rf /opt/calorisync/app && sudo mkdir -p /opt/calorisync/app && sudo tar -xzf /tmp/calorisync-deploy.tar.gz -C /opt/calorisync/app && sudo chown -R calorisync:calorisync /opt/calorisync && sudo chmod 600 /opt/calorisync/app/.env.local && sudo systemctl restart calorisync'
```

## Security cleanups to do today

⚠️ **Rotate these because they're in the transcript:**

1. Anthropic API key (`sk-ant-api03-...`) — https://console.anthropic.com/ → API keys → revoke + create new → update `.claude\secrets.env`
2. AWS access key (`AKIA...`) — IAM → Users → your user → Security credentials → delete old, create new → `aws configure`
3. Neon DB password — Neon dashboard → project → reset password → update `DATABASE_URL` and `DATABASE_URL_UNPOOLED`
4. Cloudflare API token (`cfat_j6E...`) — Cloudflare dashboard → My Profile → API Tokens → roll
5. (Lower priority) `AUTH_SECRET` was randomly generated locally, never sent over chat — no need to rotate.

After rotating, regenerate `.env.local` from `secrets.env` and redeploy.

## Open issues / known gotchas

- **Cloudflare SSL mode**: I couldn't read/edit (your token is zone-scoped to DNS only). Currently appears to be "Full" — Caddy on origin uses self-signed `tls internal` to satisfy CF. Works fine, but if you ever flip to "Full (strict)" it'll break. Set to "Flexible" in dashboard if you'd prefer simpler origin (HTTP-only).
- **Avast SSL MITM** locally was the root cause of multiple TLS failures (AWS CLI, npm install, curl from your machine). Workaround `NODE_EXTRA_CA_CERTS` env var is `setx`-persisted for future shells. Avast's HTTPS scanning has no UI toggle in your build — only fix would be uninstall.
- **Workspace root warning** in builds: Next.js detects both `D:\calorisync\package-lock.json` and the worktree's lockfile. I pinned `turbopack.root` in `next.config.ts` to silence it.

## Commits during this session

```
3512b92  Add log-meal UI + AI photo/text parse + console pages
79fe8bd  Deploy live to calorisync.com via EC2 + Cloudflare proxy
1679e75  Build landing page, console scaffolding, auth flow, DB schema
9994647  Scaffold Next.js 16 + Tailwind 4 + shadcn config  (pre-session)
75a450c  Add CLAUDE.md with locked product decisions  (pre-session)
```

PR ready to open: https://github.com/rahulMehndiratta2602/calorisync/pull/new/claude/condescending-grothendieck-dc9f73

---

Happy testing. Wake me up if you need anything.
