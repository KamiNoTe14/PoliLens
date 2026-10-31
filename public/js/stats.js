// Anonymous totals. What gets stored per submission:
//   v  — question set version (number)
//   a  — answers as a string of digits 0-4, "x" for skipped (e.g. "3401x2...")
//   st — two-letter state code, only if the person chose to give it
// Nothing else: no IP, no timestamp from the browser, no cookies, no account.
// Every few minutes a GitHub Actions job folds new submissions into one summary
// document that every visitor reads, then deletes them (see tally/tally.mjs).

import { CONFIG } from './config.js';
import { QUESTIONS, QUESTION_SET_VERSION } from './questions.js';

const SDK = 'https://www.gstatic.com/firebasejs/11.0.2/';
let dbPromise = null;

export const isDemo = () => !CONFIG.firebase;

async function db() {
  if (isDemo()) return null;
  if (!dbPromise) {
    dbPromise = (async () => {
      const { initializeApp } = await import(SDK + 'firebase-app.js');
      const app = initializeApp(CONFIG.firebase);
      if (CONFIG.appCheckSiteKey) {
        const { initializeAppCheck, ReCaptchaV3Provider } = await import(SDK + 'firebase-app-check.js');
        initializeAppCheck(app, { provider: new ReCaptchaV3Provider(CONFIG.appCheckSiteKey), isTokenAutoRefreshEnabled: true });
      }
      const fs = await import(SDK + 'firebase-firestore.js');
      return { fs, d: fs.getFirestore(app) };
    })();
  }
  return dbPromise;
}

export async function submitAnswers(answerString, state) {
  if (isDemo()) return { ok: true, demo: true };
  const { fs, d } = await db();
  const doc = { v: QUESTION_SET_VERSION, a: answerString };
  if (state) doc.st = state;
  await fs.addDoc(fs.collection(d, 'responses'), doc);
  return { ok: true };
}

// Returns { n, counts: { [qid]: [c0..c4] }, sample: [answerString, ...], demo }
export async function getSummary() {
  if (isDemo()) return demoSummary();
  const { fs, d } = await db();
  const snap = await fs.getDoc(fs.doc(d, 'stats', 'summary_v' + QUESTION_SET_VERSION));
  if (!snap.exists()) return { n: 0, counts: {}, sample: [], demo: false };
  const s = snap.data();
  return { n: s.n || 0, counts: s.counts || {}, sample: s.sample || [], demo: false };
}

// ---------- demo data (only used when Firebase isn't configured) ----------
let demoCache = null;
function demoSummary() {
  if (demoCache) return demoCache;
  // Deterministic PRNG so the demo looks the same on every load.
  let seed = 42;
  const rnd = () => (seed = (seed * 16807) % 2147483647) / 2147483647;
  // Rough, made-up population: two loose camps plus a middle, with a few
  // questions most people agree on. Purely illustrative.
  const consensus = { guns_background: 1, gov_stocks: 1, gov_utilities: 1, local_datacenters: 1, vote_id: 1, lgbtq_jobs: 1, health_workreq: 1 };
  const sample = [];
  const counts = {};
  QUESTIONS.forEach((q) => (counts[q.id] = [0, 0, 0, 0, 0]));
  for (let p = 0; p < 600; p++) {
    const camp = rnd() < 0.42 ? 1 : rnd() < 0.72 ? -1 : 0; // +1 leans toward axis pos poles
    let s = '';
    QUESTIONS.forEach((q) => {
      if (rnd() < 0.04) { s += 'x'; return; }
      let lean;
      if (consensus[q.id]) lean = 1.1;
      else lean = camp * q.sign * 1.2;
      const val = Math.max(-2, Math.min(2, Math.round(lean + (rnd() - 0.5) * 2.6)));
      const digit = val + 2;
      counts[q.id][digit]++;
      s += digit;
    });
    sample.push(s);
  }
  demoCache = { n: sample.length, counts, sample, demo: true };
  return demoCache;
}
