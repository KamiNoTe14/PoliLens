// Folds new anonymous submissions into the summary document, then deletes them.
// Runs every few minutes from GitHub Actions (.github/workflows/tally.yml), which
// lets the whole backend stay on Firebase's free Spark plan: no Cloud Functions.
//
// Summary doc stats/summary_v{n}:
//   n       total submissions
//   counts  { [questionId]: [c0, c1, c2, c3, c4] }
//   sample  the most recent SAMPLE_SIZE answer strings (for "people least like you")
//   states  { MI: 123, ... } submission counts by self-reported state
//
// Each batch writes the new summary and deletes the submissions it counted in
// one atomic commit, so a submission is never counted twice or lost.

import { initializeApp, cert } from 'firebase-admin/app';
import { getFirestore, FieldValue } from 'firebase-admin/firestore';
import { QUESTIONS, QUESTION_SET_VERSION } from '../public/js/questions.js';

const SAMPLE_SIZE = 2000;
const BATCH = 400; // Firestore allows 500 writes per commit: 1 summary + up to 400 deletes.
const N = QUESTIONS.length;
const VALID = new RegExp(`^[0-4x]{${N}}$`);

const raw = process.env.FIREBASE_SERVICE_ACCOUNT;
if (!raw) {
  console.log('FIREBASE_SERVICE_ACCOUNT is not set yet; nothing to do.');
  process.exit(0);
}

initializeApp({ credential: cert(JSON.parse(raw)) });
const db = getFirestore();
const summaryRef = db.doc(`stats/summary_v${QUESTION_SET_VERSION}`);

let total = 0;
for (;;) {
  const pending = await db.collection('responses').limit(BATCH).get();
  if (pending.empty) break;

  const snap = await summaryRef.get();
  const cur = snap.exists ? snap.data() : {};
  const counts = cur.counts || {};
  const states = cur.states || {};
  let sample = cur.sample || [];
  let n = cur.n || 0;
  let skipped = 0;

  const batch = db.batch();
  for (const doc of pending.docs) {
    const d = doc.data();
    batch.delete(doc.ref);
    // The security rules already enforce this shape; check again anyway.
    if (d.v !== QUESTION_SET_VERSION || typeof d.a !== 'string' || !VALID.test(d.a)) { skipped++; continue; }
    QUESTIONS.forEach((q, i) => {
      const ch = d.a[i];
      if (ch === 'x') return;
      const arr = counts[q.id] || [0, 0, 0, 0, 0];
      arr[Number(ch)]++;
      counts[q.id] = arr;
    });
    sample.push(d.a);
    if (typeof d.st === 'string' && /^[A-Z]{2}$/.test(d.st)) states[d.st] = (states[d.st] || 0) + 1;
    n++;
  }
  sample = sample.slice(-SAMPLE_SIZE);

  batch.set(summaryRef, { n, counts, sample, states, updated: FieldValue.serverTimestamp() });
  await batch.commit();
  total += pending.size - skipped;
  console.log(`Counted ${pending.size - skipped} submissions${skipped ? `, discarded ${skipped} malformed` : ''}. Total now ${n}.`);
}

console.log(total ? `Done. Added ${total} submissions.` : 'No new submissions.');
