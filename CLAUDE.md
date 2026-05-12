# Calorisync

Calorie-tracking app with AI-assisted meal logging (photo + voice), macro targeting, and a chat interface. Stripe-billed, magic-link auth, Postgres-backed.

## Locked decisions

The values in this section are **settled**. Do not relitigate, refactor away from, or "improve" them without explicit user direction. If a task appears to require contradicting one, stop and surface it first.

### Pricing (Stripe Checkout — test mode in week 1)

- Monthly: $9.00 USD/mo — product `Calorisync Pro`, price `price_monthly`
- Annual: $69.00 USD/yr (~36% off; chosen for retention) — price `price_annual`
- Trial: 14 days, no card required up front. Collect card at trial→paid transition.
- Free tier after trial: read-only access to past data + manual logging. No AI parsing, no chat. (Rationale: churned users never lose history.)
- Grace: 7 days after failed charge before downgrade.

### Default macro split

Recomputed whenever `weight_kg` or `goal` changes. Overridable per-user via `profile.diet_style`.

- Protein: `max(1.6 g/kg lean mass, 30% of daily kcal)`
- Fat: `max(0.6 g/kg body weight, 25% of daily kcal)`
- Carbs: remainder

Diet-style overrides:

- Keto — fat 70% / protein 25% / carbs 5%
- High-protein (lifters) — protein 35% / fat 25% / carbs 40%
- Mediterranean — fat 40% / protein 20% / carbs 40%

### Time-zone handling

- At signup, capture `Intl.DateTimeFormat().resolvedOptions().timeZone` client-side and POST as part of `/v1/profile/onboard`.
- Store as an IANA string in `user_profile.timezone` (e.g. `America/New_York`, `Asia/Kolkata`).
- All `meals.log_date` computed via `(logged_at AT TIME ZONE user.timezone)::date` in Postgres. **Never** naive UTC date.
- Daily/weekly cron jobs tick once per minute and check `(now() AT TIME ZONE user.timezone)::time` against the user's wake-time.
- User can change tz in Settings; existing meals are **not** retroactively rebucketed (would skew history).
- DST handled by Postgres via IANA — no special code.

### Other defaults

- **AI auto-save confidence threshold:** 0.7. Below that, force the edit UX.
- **Photo cap:** 8 MB before resize. Resize to 1280px longest edge before sending to Sonnet vision.
- **Voice clip cap:** 60s. Reject longer client-side.
- **Chat history retained in context:** last 20 turns + the cached system prefix.
- **Magic link:** 30-minute expiry, single-use.
- **Session cookie:** 90-day rolling, `httpOnly` + `SameSite=Lax` + `Secure`.
- **Rate limits:** signup 5/h per IP; meal-log 60/h per user; chat 30/h per user.
- **Newsletter:** weekly, Saturday 9am user-local. Opt-in checkbox at onboarding (**not** pre-checked).
- **USDA cache TTL:** 30 days. Refresh on next miss.
- **Whisper model:** `whisper-1`. Language hint = user's stated locale.
- **Anthropic prompt cache breakpoint:** at end of system prompt + `user_facts` block, before per-turn data.
