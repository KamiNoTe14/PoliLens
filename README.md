# PoliLens

*See politics without the polarization.*

Answer 26 issue questions, see how many people land where you do (including people who disagree with you on most things), then get a sourced side-by-side look at your ballot. V1 covers Michigan's Nov 3, 2026 statewide races in depth and uses Google's Civic Information API for everyone else.

Plain HTML/CSS/JS with no build step. Hosted free on GitHub Pages; anonymous totals live in Firestore on Firebase's free Spark plan, updated every few minutes by a scheduled GitHub Actions job. No paid plan or Cloud Functions needed.

## Files

| Path | What it is |
|---|---|
| `public/js/questions.js` | The 26 questions and the issue axes. **Change wording → bump `QUESTION_SET_VERSION`.** |
| `public/js/michigan.js` | Michigan races, candidate positions, proposals, and every source link. |
| `public/js/config.js` | Firebase config + API keys. Empty = demo mode with clearly labeled fake totals. |
| `public/js/stats.js` | Anonymous submit + reading the one summary doc. |
| `public/js/civic.js` | Ballot lookup via Google Civic Information API. |
| `tally/tally.mjs` | Run by `.github/workflows/tally.yml` every ~5 minutes. Folds new submissions into `stats/summary_v1` (counts + last 2,000 answer strings), then deletes them. |
| `.github/workflows/pages.yml` | Publishes `public/` to GitHub Pages on every push to `main`. |
| `firestore.rules` | Create-only, shape-checked submissions. Nobody can read raw responses. |

## Run locally

```
cd public && python3 -m http.server 8080
```
Open http://localhost:8080. Without Firebase config it runs in demo mode.

## Setup (about 20 minutes, all free)

The site is served by GitHub Pages at `https://kaminote14.github.io/PoliLens/`.

1. **GitHub Pages.** Repo **Settings → Pages → Source: GitHub Actions**. Then re-run the "Deploy to GitHub Pages" workflow from the Actions tab.
2. **Firebase project.** console.firebase.google.com → Create a project. Turn Google Analytics off. Stay on the free **Spark** plan.
3. **Firestore.** Build → Firestore Database → Create database (Standard edition, location `nam5`, production mode).
4. **Security rules.** Firestore → **Rules** tab → replace everything with the contents of `firestore.rules` → Publish.
5. **Web app config.** Project settings → General → Your apps → Web (`</>`) → register (leave Firebase Hosting unchecked). Paste the config object into `public/js/config.js` as `firebase: {...}`. This config is public by design.
6. **Service account for the tally job.** Project settings → **Service accounts** → Generate new private key. In GitHub: repo **Settings → Secrets and variables → Actions → New repository secret**, name it `FIREBASE_SERVICE_ACCOUNT`, and paste the entire JSON file as the value. Then delete the downloaded file; never commit it.
7. **Check the tally job.** Actions tab → "Tally submissions" → Run workflow. It should finish with "No new submissions." From then on it runs every ~5 minutes on its own.
8. **App Check (do this before sharing widely).** Create a reCAPTCHA v3 key at google.com/recaptcha/admin for the domain `kaminote14.github.io`. In Firebase: App Check → register the web app with reCAPTCHA v3 using that key's secret. Put the site key in `appCheckSiteKey`, push, confirm submissions still work, then **Enforce** for Firestore. Stops bots from flooding the totals.
9. **Civic API key (optional).** console.cloud.google.com (same project) → APIs & Services → enable *Google Civic Information API* → Credentials → Create API key → restrict to HTTP referrer `kaminote14.github.io/*` and to the Civic Information API only. Paste into `civicApiKey`. Without it, the ballot page links to official lookup tools instead.

Using the Firebase CLI instead of the console for step 4 also works: `firebase deploy --only firestore:rules --project YOUR-PROJECT-ID`.

If you add a custom domain such as polilens.app later (Settings → Pages → Custom domain), add it to the reCAPTCHA domains and the Civic API key's referrers too.

## Before launch checklist

- [ ] Have at least two people who vote differently from each other read every question in `questions.js` and every summary in `michigan.js` and flag anything that feels tilted.
- [ ] Spot-check every source link in `michigan.js`.
- [ ] Test the ballot lookup with a Michigan address and an out-of-state address.
- [ ] App Check enforced.

## Known limits (v1)

- Totals update every ~5 minutes, and GitHub may run scheduled jobs late when it's busy. Submissions wait safely in Firestore until the next run.
- Each run counts submissions and deletes them in one atomic commit, so nothing is double-counted or lost if a run fails.
- Spark's free quota (50k reads, 20k writes, 20k deletes per day) covers roughly 15,000+ submissions a day. Past that, Firestore pauses until the quota resets.
- Totals describe whoever takes the quiz, not a scientific sample.
- Candidate summaries outside Michigan come only from the Civic API (names, parties, links), not issue positions.

## Ideas for after Nov 3

- Per-state totals (already collected as `states` in the summary doc).
- 2027 local races and 2028 primaries; more states' candidate data.
- Cross-tab view: "people who answered X on guns also mostly agree on Y."
