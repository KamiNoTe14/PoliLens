// Folds each anonymous submission into stats/summary_v{n}:
//   n       — total submissions
//   counts  — { [questionId]: [c0, c1, c2, c3, c4] }
//   sample  — the most recent SAMPLE_SIZE answer strings (used for
//             "people least like you" comparisons in the browser)
//   states  — { MI: 123, ... } submission counts by self-reported state
// One summary doc = one read per visitor, regardless of how many people answer.
const { onDocumentCreated } = require('firebase-functions/v2/firestore');
const { initializeApp } = require('firebase-admin/app');
const { getFirestore, FieldValue } = require('firebase-admin/firestore');

initializeApp();
const db = getFirestore();

// Must match public/js/questions.js order exactly.
const QUESTION_IDS = [
  'abortion_legal', 'guns_background', 'guns_burden', 'health_guarantee', 'health_workreq',
  'imm_path', 'imm_wall', 'climate_priority', 'env_toostrict', 'school_vouchers',
  'tax_millionaires', 'tax_income', 'labor_unions', 'minwage_raise', 'vote_id', 'vote_mail',
  'lgbtq_jobs', 'lgbtq_sports', 'justice_bail', 'justice_police', 'econ_housing',
  'trade_tariffs', 'military_iran', 'gov_stocks', 'gov_utilities', 'local_datacenters',
];
const SAMPLE_SIZE = 2000;

exports.tallyResponse = onDocumentCreated({ document: 'responses/{id}', retry: true, maxInstances: 1 }, async (event) => {
  const data = event.data?.data();
  if (!data || typeof data.a !== 'string' || !/^[0-4x]{26}$/.test(data.a) || data.v !== 1) return;
  const ref = db.doc(`stats/summary_v${data.v}`);

  await db.runTransaction(async (tx) => {
    const snap = await tx.get(ref);
    const cur = snap.exists ? snap.data() : { n: 0, counts: {}, sample: [], states: {} };
    const counts = cur.counts || {};
    QUESTION_IDS.forEach((id, i) => {
      const ch = data.a[i];
      if (ch === 'x') return;
      const arr = counts[id] || [0, 0, 0, 0, 0];
      arr[Number(ch)]++;
      counts[id] = arr;
    });
    const sample = (cur.sample || []).concat(data.a).slice(-SAMPLE_SIZE);
    const states = cur.states || {};
    if (data.st) states[data.st] = (states[data.st] || 0) + 1;
    tx.set(ref, { n: (cur.n || 0) + 1, counts, sample, states, updated: FieldValue.serverTimestamp() });
  });
});
