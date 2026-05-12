# Calorisync — Morning Briefing

Good morning. Site is live at **[https://calorisync.com](https://calorisync.com)** 🟢

I kept building after the first checkpoint. Lots of new things to test.

## What's new since the first briefing

| Feature | Where | Status |
|---|---|---|
| **Demo mode** (no signup needed) | [/demo](https://calorisync.com/demo) | ✅ Full dashboard preview with realistic data |
| **Admin dashboard** (gated to admin emails) | /admin/* | ✅ 6 sub-pages: overview, users, newsletter, email-events, audit-log, feature-flags |
| **CSV exports** | /api/meals/export, /api/admin/newsletter/export | ✅ Live |
| **Audit log** | wired into signin/verify/save/newsletter | ✅ Every consequential action recorded |
| **Quick-add food + autocomplete** | /console/log Quick add tab | ✅ 45 foods, type-ahead, auto-fill macros |
| **AWS S3 photo persistence** | calorisync-meal-photos-ap-south-1 + IAM role | ✅ Photos uploaded on parse; meal_photos rows on save |
| **Custom 404 page** | any unknown URL | ✅ Branded, with helpful links |
| **PWA manifest + icon** | /manifest.webmanifest, /icon.svg | ✅ 'Add to home screen' works |
| **Account deletion** | settings → danger zone | ✅ Typed-confirmation modal |
| **Dynamic OG image** | /opengraph-image | ✅ 1200×630 PNG generated per request (Satori) |
| **Streak counter + weekly chart** | /console dashboard | ✅ TZ-aware via Postgres `AT TIME ZONE` |
| **Daily summary cron** | /api/cron/daily-summary + systemd timer | ✅ Runs nightly at 03:30 UTC |
| **Legal pages** | /privacy, /terms, /about, /help, /security, /contact, /changelog, /features, /pricing | ✅ All real content, no 404s |

## Live URLs to test

```
https://calorisync.com/                # landing
https://calorisync.com/demo            # ← play with the dashboard, no signup
https://calorisync.com/features        # dedicated features page
https://calorisync.com/pricing         # dedicated pricing
https://calorisync.com/help            # FAQ
https://calorisync.com/security        # security practices
https://calorisync.com/changelog       # release log
https://calorisync.com/opengraph-image # OG image (preview before sharing)
https://calorisync.com/sitemap.xml     # SEO sitemap
https://calorisync.com/robots.txt      # SEO robots
https://calorisync.com/signin          # magic-link sign-in
https://calorisync.com/manifest.webmanifest  # PWA manifest
```

## Sign in to see admin + console

The magic-link email isn't actually sent (Mailpanzer not built yet — that's what
*you* are building, right?). To grab the link, after submitting the signin form:

```bash
ssh -i D:\calorisync\.claude\calorisync-deploy.pem ec2-user@65.0.54.134 \
  'sudo journalctl -u calorisync -n 30 --no-pager | grep "magic-link for" | tail -1'
```

Open the URL it prints in any browser. You'll be at /console/onboarding, then
/console with full dashboard.

**Admin access**: since `ADMIN_EMAILS=mandyratta@gmail.com`, signing in with
your usual email shows the "Open admin dashboard" button in Settings.

## Infrastructure overview

### AWS account `514348993251`, region `ap-south-1`

- **EC2**: `i-04eef4382fdf79611` (t3.small) at `65.0.54.134`
  - Stack: Caddy v2.11.2 → Next.js standalone via systemd `calorisync.service`
  - IAM role `calorisync-ec2-app` attached (S3 PutObject/GetObject on the photos bucket)
  - systemd timer `calorisync-daily-summary.timer` fires at 03:30 UTC nightly
- **S3 bucket** `calorisync-meal-photos-ap-south-1`
  - Private (block-all-public), versioned, encrypted (SSE-AES256)
  - CORS for calorisync.com origins, lifecycle rules (abort orphan multipart after 1d)
  - Tagged Project=calorisync, Env=prod, Service=meal-photos
- **Security group** `sg-056ceebd3ac0cb5a9`
  - 22 from `223.185.55.177/32` (your IP — update if you've moved)
  - 80, 443 from `0.0.0.0/0`
- **SSH key**: `D:\calorisync\.claude\calorisync-deploy.pem`

### Cloudflare DNS, zone `d432a137a6f126e199807b6efadce28e`

- `A calorisync.com → 65.0.54.134` (proxied)
- `A www.calorisync.com → 65.0.54.134` (proxied)
- Mail records (DKIM, SPF, DMARC) untouched

### Neon Postgres (ap-southeast-1)

- 15 tables, schema applied
- Pooled + direct URLs in [.claude/secrets.env](.claude/secrets.env)

## Recent commits this session

```
dee7d49  Fix OG image: use display:flex (Satori doesn't support inline-flex)
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

12 commits. ~7 hours of autonomous work.

## Cost estimate (running monthly)

| Item | Free tier | After free tier |
|---|---|---|
| EC2 t3.small ap-south-1 | $0 (12-mo free for new accts) | ~$17/mo |
| EBS 15GB gp3 | $0 (within 30GB free) | ~$1.50/mo |
| S3 calorisync-meal-photos | $0 (under 5GB) | $0.023/GB |
| Cloudflare proxy + TLS | $0 forever | $0 |
| Neon free tier | $0 | $0 (autopauses) |
| Anthropic API (per token) | n/a | varies |
| **Estimated steady-state** | **$0** | **~$20–30/mo** |

## What I'd build next

In priority order, if you give me more time:

1. **Wire Mailpanzer SMTP/API** into the email adapter — replace stub
2. **Photo display** in the meal-detail view (currently uploads but isn't shown back)
3. **Recipes & meal templates** — save common meals as one-click logs
4. **Weekly digest email** preview in admin (using daily_summary data)
5. **Apple Health / Strava integrations**
6. **More AI features**: chat assistant for diet questions; recipe-from-photo
7. **Internationalization** — units toggle (kg/lbs, cm/in)
8. **Mobile-first onboarding tweaks** — currently desktop-optimized

## Security cleanups to do today

⚠️ **Rotate these because they're in the transcript:**

1. Anthropic API key (sk-ant-api03-…) → https://console.anthropic.com/
2. AWS access key (`AKIA…`) → IAM Console
3. Neon DB password → Neon dashboard
4. Cloudflare API token (`cfat_j6E…`) → Cloudflare API tokens
5. CRON_SECRET (generated locally, never sent over chat) — no rotation needed

After rotating, regenerate `.env.local` from `secrets.env` and redeploy.

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

## Path map

- Worktree: `D:\calorisync\.claude\worktrees\condescending-grothendieck-dc9f73`
- Secrets: `D:\calorisync\.claude\secrets.env`
- SSH key: `D:\calorisync\.claude\calorisync-deploy.pem`
- EC2 state: `D:\calorisync\.claude\ec2-state.json`
- CA bundle: `C:\Users\my\.aws\ca-bundle.pem`
- Progress log: `D:\calorisync\.claude\progress.md`
- Branch: `claude/condescending-grothendieck-dc9f73`
- PR ready: https://github.com/rahulMehndiratta2602/calorisync/pull/new/claude/condescending-grothendieck-dc9f73

Wake me up if you need anything — there's still budget for fixes.
