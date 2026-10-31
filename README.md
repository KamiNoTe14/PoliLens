# PoliLens

*See politics without the polarization.*

Answer 26 issue questions, see how many people land where you do (including people who disagree with you on most things), then get a sourced side-by-side look at your ballot. V1 covers Michigan's Nov 3, 2026 statewide races in depth and uses Google's Civic Information API for everyone else.

Plain HTML/CSS/JS with no build step. Firebase Hosting + Firestore + one Cloud Function.

## Files

| Path | What it is |
|---|---|
| `public/js/questions.js` | The 26 questions and the issue axes. **Change wording → bump `QUESTION_SET_VERSION`.** |
| `public/js/michigan.js` | Michigan races, candidate positions, proposals, and every source link. |
| `public/js/config.js` | Firebase config + API keys. Empty = demo mode with clearly labeled fake totals. |
| `public/js/stats.js` | Anonymous submit + reading the one summary doc. |
| `public/js/civic.js` | Ballot lookup via Google Civic Information API. |
| `functions/index.js` | Folds each submission into `stats/summary_v1` (counts + last 2,000 answer strings). |
| `firestore.rules` | Create-only, shape-checked submissions. Nobody can read raw responses. |

## Run locally

```
cd public && python3 -m http.server 8080
```
Open http://localhost:8080. Without Firebase config it runs in demo mode.

## Hosting on GitHub Pages (current setup)

The site itself is served by GitHub Pages at `https://kaminote14.github.io/PoliLens/`. The workflow in `.github/workflows/pages.yml` publishes `public/` on every push to `main`.

One-time setup: repo **Settings → Pages → Source: GitHub Actions**.

Firebase is still used for the anonymous totals (Firestore + one Cloud Function), just not for hosting. Follow steps 1–5 below, then deploy only the backend:

```
firebase deploy --only firestore,functions
```

When restricting the Civic API key (step 5), allow the referrer `kaminote14.github.io/*`. If you later add a custom domain such as polilens.app, add it as well.

## Deploy (about 20 minutes)

1. **Firebase project.** console.firebase.google.com → Add project. Upgrade to the **Blaze** plan (Cloud Functions need it; at this scale it costs about nothing — set a $5 budget alert).
2. **Firestore.** Build → Firestore Database → Create (production mode, `nam5`).
3. **Web app config.** Project settings → Your apps → Web → register. Paste the config object into `public/js/config.js` as `firebase: {...}`.
4. **App Check (do this before sharing widely).** App Check → register the web app with reCAPTCHA v3 → put the site key in `appCheckSiteKey` → enforce for Firestore. Stops bots from flooding the totals.
5. **Civic API key.** console.cloud.google.com (same project) → APIs & Services → enable *Google Civic Information API* → Credentials → Create API key → restrict to HTTP referrers (`yourdomain.com/*`, `*.web.app/*`) and to the Civic Information API only. Paste into `civicApiKey`.
6. **Deploy.**
   ```
   npm i -g firebase-tools
   firebase login
   # put your project ID in .firebaserc
   cd functions && npm install && cd ..
   firebase deploy
   ```
7. **Custom domain (optional).** Hosting → Add custom domain.

## Before launch checklist

- [ ] Have at least two people who vote differently from each other read every question in `questions.js` and every summary in `michigan.js` and flag anything that feels tilted.
- [ ] Spot-check every source link in `michigan.js`.
- [ ] Test the ballot lookup with a Michigan address and an out-of-state address.
- [ ] App Check enforced.

## Known limits (v1)

- The summary doc is updated by one function instance in a transaction, which handles a few submissions per second. If the site goes viral, switch to sharded counters.
- Firestore triggers are at-least-once, so a rare retry can double-count one submission.
- Totals describe whoever takes the quiz, not a scientific sample.
- Candidate summaries outside Michigan come only from the Civic API (names, parties, links), not issue positions.

## Ideas for after Nov 3

- Per-state totals (already collected as `states` in the summary doc).
- 2027 local races and 2028 primaries; more states' candidate data.
- Cross-tab view: "people who answered X on guns also mostly agree on Y."
