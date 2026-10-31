import { QUESTIONS, ISSUES, SCALE, QUESTION_SET_VERSION, issueScores } from './questions.js';
import { ELECTION, RACES, PROPOSALS } from './michigan.js';
import { submitAnswers, getSummary, isDemo } from './stats.js';
import { lookupBallot, hasCivicKey, FALLBACK_LINKS } from './civic.js';

const N = QUESTIONS.length;
const KEY = 'ctyt_answers_v' + QUESTION_SET_VERSION;
const SENT = 'ctyt_sent_v' + QUESTION_SET_VERSION;
const main = document.getElementById('main');

// ---------- small helpers ----------
const esc = (s) => String(s ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pct = (x) => Math.round(x * 100) + '%';
const store = {
  get(k) { try { return localStorage.getItem(k); } catch { return null; } },
  set(k, v) { try { localStorage.setItem(k, v); } catch { /* private mode */ } },
  del(k) { try { localStorage.removeItem(k); } catch { /* ignore */ } },
};
const src = (s) => s ? `<a class="src" href="${esc(s.url)}" target="_blank" rel="noopener">Source: ${esc(s.title)}</a>` : '';
const sideOf = (d) => (d === 'x' || d == null ? null : d < 2 ? -1 : d > 2 ? 1 : 0);
const scaleLabel = (d) => (d === 'x' || d == null ? 'Skipped' : SCALE[d].label);

let answers = loadAnswers();
let qIndex = Math.max(0, answers.findIndex((a) => a == null));
if (qIndex === -1) qIndex = 0;

function loadAnswers() {
  const s = store.get(KEY);
  if (s && s.length === N) return [...s].map((c) => (c === '.' ? null : c === 'x' ? 'x' : Number(c)));
  return Array(N).fill(null);
}
function saveAnswers() { store.set(KEY, answers.map((a) => (a == null ? '.' : a)).join('')); }
const complete = () => answers.every((a) => a != null);
const answerString = () => answers.map((a) => (a === 'x' ? 'x' : a)).join('');

if (isDemo()) document.getElementById('demo-banner').hidden = false;

// ---------- router ----------
const routes = { '': home, quiz, finish, results, ballot, michigan, about };
function route() {
  const name = location.hash.replace(/^#\/?/, '').split('?')[0];
  const view = routes[name] || home;
  document.querySelectorAll('.top nav a').forEach((a) => {
    if (a.getAttribute('href') === '#/' + name) a.setAttribute('aria-current', 'page');
    else a.removeAttribute('aria-current');
  });
  window.scrollTo(0, 0);
  view();
  main.focus({ preventScroll: true });
}
window.addEventListener('hashchange', route);

// ---------- shared stats ----------
let summaryPromise = null;
const summary = () => (summaryPromise ||= getSummary().catch(() => ({ n: 0, counts: {}, sample: [], demo: false, error: true })));

function questionSplit(counts, q) {
  const c = counts[q.id] || [0, 0, 0, 0, 0];
  const dis = c[0] + c[1], neu = c[2], agr = c[3] + c[4];
  const total = dis + neu + agr;
  return { dis, neu, agr, total, took: dis + agr };
}
// Questions where at least 2 of 3 people who took a side agree with each other.
function consensusCount(s) {
  return QUESTIONS.filter((q) => {
    const { dis, agr, took } = questionSplit(s.counts, q);
    return took >= 20 && Math.max(dis, agr) / took >= 2 / 3;
  }).length;
}

// ---------- views ----------
async function home() {
  main.innerHTML = `
    <section class="hero">
      <div>
        <h1>We agree on more than we’ve been told.</h1>
        <p class="lede">Answer ${N} questions on the issues. See how many people land where you do, then get a sourced, side-by-side look at what’s on your ballot.</p>
        <div class="row" style="margin-top:1.75rem">
          <a class="btn" href="#/quiz">${answers.some((a) => a != null) && !complete() ? 'Continue the questions' : 'Start the questions'}</a>
          <a class="btn ghost" href="#/ballot">Look up my ballot</a>
        </div>
        <p class="small" style="margin-top:1rem">Takes about 5 minutes. No sign-up. Your answers are saved only as anonymous totals.</p>
      </div>
      <figure class="venn" aria-labelledby="venn-cap" style="margin:0">
        <svg viewBox="0 0 420 300" role="img" aria-labelledby="venn-cap">
          <defs><clipPath id="clipA"><circle cx="150" cy="150" r="120"/></clipPath></defs>
          <circle class="ca" cx="150" cy="150" r="120"/>
          <circle class="cb" cx="270" cy="150" r="120"/>
          <circle class="ov" cx="270" cy="150" r="120" clip-path="url(#clipA)"/>
          <text class="big" x="210" y="160" text-anchor="middle" id="venn-num">…</text>
          <text class="lab" x="210" y="186" text-anchor="middle">of ${N} questions</text>
        </svg>
        <figcaption id="venn-cap" class="small" style="text-align:center;max-width:24rem;margin:.6rem auto 0">Loading totals…</figcaption>
      </figure>
    </section>
    <section class="steps" aria-label="How it works">
      <div><h3>Answer the questions</h3><p>Plain statements on guns, health care, taxes, immigration and more. Agree, disagree, or say you’re not sure.</p></div>
      <div><h3>See the overlap</h3><p>Find out how many people share each of your views, including people who disagree with you on most things.</p></div>
      <div><h3>Check your ballot</h3><p>See your next election and where the candidates stand on the same issues, with a source for every claim.</p></div>
    </section>
    <section>
      <div class="notice"><p><strong>Michigan votes ${esc(ELECTION.dateLabel)}.</strong> Governor, U.S. Senate, attorney general, secretary of state, and two statewide proposals. <a href="#/michigan">See the Michigan races</a>.</p></div>
    </section>`;
  const s = await summary();
  const numEl = document.getElementById('venn-num'), cap = document.getElementById('venn-cap');
  if (!numEl) return;
  if (s.n < 20) {
    numEl.textContent = '?';
    cap.textContent = 'Totals appear once enough people have answered. Be one of the first.';
  } else {
    numEl.textContent = consensusCount(s);
    cap.textContent = `Questions where at least 2 of every 3 people who took a side agree with each other, across ${s.n.toLocaleString()} ${s.demo ? 'sample (demo) responses' : 'people so far'}.`;
  }
}

function quiz() {
  if (qIndex >= N) qIndex = N - 1;
  const q = QUESTIONS[qIndex];
  const cur = answers[qIndex];
  const done = answers.filter((a) => a != null).length;
  main.innerHTML = `
    <div class="quiz">
      <div class="progress" role="progressbar" aria-label="Progress" aria-valuemin="0" aria-valuemax="${N}" aria-valuenow="${done}"><span style="width:${(done / N) * 100}%"></span></div>
      <p class="qcount">Question ${qIndex + 1} of ${N}</p>
      <h1 class="qtext" id="qtext">${esc(q.text)}</h1>
      <div class="scale" role="group" aria-labelledby="qtext">
        ${SCALE.map((s) => `<button type="button" data-v="${s.v}" aria-pressed="${cur === s.v}">${s.label}</button>`).join('')}
      </div>
      <div class="qnav">
        <button type="button" class="link-btn" id="back" ${qIndex === 0 ? 'disabled' : ''}>Back</button>
        <button type="button" class="link-btn" id="skip">Skip this one</button>
      </div>
      <p class="hint">Keyboard: 1–5 to answer, S to skip, ← to go back.</p>
    </div>`;
  main.querySelectorAll('.scale button').forEach((b) => b.addEventListener('click', () => answer(Number(b.dataset.v))));
  main.querySelector('#skip').addEventListener('click', () => answer('x'));
  main.querySelector('#back').addEventListener('click', back);
}
function answer(v) {
  answers[qIndex] = v;
  saveAnswers();
  if (qIndex < N - 1) {
    const next = answers.findIndex((a, i) => i > qIndex && a == null);
    qIndex = next === -1 ? qIndex + 1 : next;
    quiz();
  } else if (complete()) {
    location.hash = '#/finish';
  } else {
    qIndex = answers.findIndex((a) => a == null);
    quiz();
  }
}
function back() { if (qIndex > 0) { qIndex--; quiz(); } }
document.addEventListener('keydown', (e) => {
  if (!location.hash.startsWith('#/quiz') || e.metaKey || e.ctrlKey || e.altKey) return;
  if (e.target.matches('input, select, textarea')) return;
  if (e.key >= '1' && e.key <= '5') answer(Number(e.key) - 1);
  else if (e.key.toLowerCase() === 's') answer('x');
  else if (e.key === 'ArrowLeft') back();
});

const STATES = 'AL AK AZ AR CA CO CT DE DC FL GA HI ID IL IN IA KS KY LA ME MD MA MI MN MS MO MT NE NV NH NJ NM NY NC ND OH OK OR PA RI SC SD TN TX UT VT VA WA WV WI WY'.split(' ');

function finish() {
  if (!complete()) { location.hash = '#/quiz'; return; }
  const sent = store.get(SENT) === '1';
  main.innerHTML = `
    <div class="finish">
      <h1>That’s all ${N}.</h1>
      <p class="lede">One optional question, then your results.</p>
      <div class="field">
        <label for="st">Which state do you vote in?</label>
        <select id="st"><option value="">Prefer not to say</option>${STATES.map((s) => `<option${s === 'MI' ? ' selected' : ''}>${s}</option>`).join('')}</select>
        <span class="small">Lets us show totals by state later. We never ask for anything more specific.</span>
      </div>
      ${sent ? `<p class="small">Your answers were already added to the totals from this device, so they won’t be counted twice.</p>` : `
      <label class="check"><input type="checkbox" id="share" checked><span>Add my answers to the anonymous totals. We store only the ${N} answers and the state above — no name, address, IP address, or cookie.</span></label>`}
      <div class="row" style="margin-top:1.5rem"><button class="btn" id="go">See my results</button><a class="link-btn" href="#/quiz">Change an answer</a></div>
      <p id="err" class="small" role="alert"></p>
    </div>`;
  main.querySelector('#go').addEventListener('click', async (e) => {
    const share = main.querySelector('#share');
    e.target.disabled = true;
    if (share?.checked) {
      try {
        await submitAnswers(answerString(), main.querySelector('#st').value || null);
        store.set(SENT, '1');
        summaryPromise = null;
      } catch (err) {
        main.querySelector('#err').textContent = 'Your answers couldn’t be added to the totals right now. Your results still work.';
        await new Promise((r) => setTimeout(r, 1200));
      }
    }
    location.hash = '#/results';
  });
}

async function results() {
  if (!complete()) {
    main.innerHTML = `<h1>Your results</h1><p class="lede">Answer the questions first, then your results show up here.</p><a class="btn" href="#/quiz">Start the questions</a>`;
    return;
  }
  main.innerHTML = `<h1>Your results</h1><p class="lede">Loading the totals…</p>`;
  const s = await summary();
  const enough = s.n >= 20;
  const mine = answers;

  // 1) Majority agreement per question
  let tookSide = 0, withMajority = 0;
  const rows = QUESTIONS.map((q, i) => {
    const sp = questionSplit(s.counts, q);
    const my = sideOf(mine[i]);
    const shareSame = my === 1 ? (sp.took ? sp.agr / sp.took : 0) : my === -1 ? (sp.took ? sp.dis / sp.took : 0) : null;
    if (my && sp.took) { tookSide++; if (shareSame > 0.5) withMajority++; }
    return { q, i, sp, my, shareSame };
  });

  // 2) Similarity to each person in the sample
  const sims = [];
  for (const other of s.sample) {
    let m = 0, c = 0;
    for (let i = 0; i < N; i++) {
      const a = sideOf(mine[i]), b = other[i] === 'x' ? null : sideOf(Number(other[i]));
      if (!a || !b) continue;
      c++; if (a === b) m++;
    }
    if (c >= 5) sims.push({ sim: m / c, other });
  }
  sims.sort((a, b) => a.sim - b.sim);
  const leastLike = sims.slice(0, Math.floor(sims.length / 2));
  let sharedWithOpposite = 0;
  const oppShare = {};
  QUESTIONS.forEach((q, i) => {
    const my = sideOf(mine[i]);
    if (!my || leastLike.length < 15) return;
    let same = 0, took = 0;
    for (const { other } of leastLike) {
      const b = other[i] === 'x' ? null : sideOf(Number(other[i]));
      if (!b) continue; took++; if (b === my) same++;
    }
    if (took) { oppShare[q.id] = same / took; if (same / took > 0.5) sharedWithOpposite++; }
  });
  const buckets = Array(10).fill(0);
  sims.forEach(({ sim }) => buckets[Math.min(9, Math.floor(sim * 10))]++);
  const maxB = Math.max(1, ...buckets);
  const median = sims.length ? sims[Math.floor(sims.length / 2)].sim : 0;

  const sorted = [...rows].sort((a, b) => (b.shareSame ?? -1) - (a.shareSame ?? -1));
  const scores = issueScores(mine);

  main.innerHTML = `
    <h1>Your results</h1>
    ${s.error ? `<div class="notice warn"><p>The totals couldn’t be loaded right now, so only your own answers are shown below.</p></div>` : ''}
    ${!enough && !s.error ? `<div class="notice"><p>You’re one of the first ${s.n ? s.n.toLocaleString() : ''} people here. Comparisons fill in once at least 20 people have answered, so check back soon.</p></div>` : ''}
    ${enough ? `
    <section>
      <div class="headline-stat">
        <div class="num">${withMajority}<span style="font-size:.45em;font-weight:600"> / ${tookSide}</span></div>
        <p>Of the ${tookSide} questions where you took a side, most people who took a side agree with you on ${withMajority}.</p>
      </div>
    </section>
    ${leastLike.length >= 15 ? `
    <section>
      <h2>Even the people least like you agree with you on ${sharedWithOpposite} ${sharedWithOpposite === 1 ? 'question' : 'questions'}.</h2>
      <p>We took the half of all respondents whose answers differ from yours the most. On ${sharedWithOpposite} of your answers, a majority of them still landed on your side.</p>
      <h3 style="margin-top:2rem">How much each person agrees with you</h3>
      <div class="hist" aria-hidden="true">${buckets.map((b) => `<div style="height:${(b / maxB) * 100}%"></div>`).join('')}</div>
      <div class="hist-axis" aria-hidden="true"><span>Agree on none</span><span>Agree on half</span><span>Agree on all</span></div>
      <p class="small">The typical person here agrees with you on ${pct(median)} of the questions where you both took a side. Based on ${sims.length.toLocaleString()} ${s.demo ? 'demo' : 'recent'} responses.</p>
    </section>` : ''}` : ''}
    <section>
      <h2>Question by question</h2>
      <p class="small">Bars show everyone who answered: <span style="color:#7d8996">disagree</span>, not sure, and <span style="color:var(--lake)">agree</span>.</p>
      <ol class="qlist">${sorted.map(({ q, i, sp, my, shareSame }) => `
        <li class="qrow">
          <div><p>${esc(q.text)}${oppShare[q.id] > 0.5 ? '<span class="tag">Shared across the divide</span>' : ''}</p>
            <p class="you">You: ${scaleLabel(mine[i])}${my && sp.took ? ` — ${pct(shareSame)} of people who took a side are with you` : ''}</p></div>
          <div>${sp.total ? `
            <div class="split" role="img" aria-label="${pct(sp.dis / sp.total)} disagree, ${pct(sp.neu / sp.total)} not sure, ${pct(sp.agr / sp.total)} agree">
              <span class="d" style="width:${(sp.dis / sp.total) * 100}%"></span><span class="n" style="width:${(sp.neu / sp.total) * 100}%"></span><span class="a" style="width:${(sp.agr / sp.total) * 100}%"></span>
            </div>
            <div class="split-lab"><span>${pct(sp.dis / sp.total)} disagree</span><span>${pct(sp.agr / sp.total)} agree</span></div>` : '<p class="small">No totals yet</p>'}
          </div>
        </li>`).join('')}
      </ol>
    </section>
    <section>
      <h2>Where you land, issue by issue</h2>
      <p>No party labels. Just where your answers put you between two ends of each debate.</p>
      <div class="axes">${Object.keys(ISSUES).filter((k) => k in scores).map((k) => `
        <div>
          <div class="axis-name">${esc(ISSUES[k].name)}</div>
          <div class="axis" role="img" aria-label="${esc(ISSUES[k].name)}: ${describeLean(scores[k], ISSUES[k])}"><span class="dot" style="left:${((scores[k] + 2) / 4) * 100}%"></span></div>
          <div class="axis-poles"><span>${esc(ISSUES[k].neg)}</span><span>${esc(ISSUES[k].pos)}</span></div>
        </div>`).join('')}
      </div>
    </section>
    <section>
      <h2>Next: your ballot</h2>
      <p>See where the candidates in your next election stand on these same issues.</p>
      <div class="row"><a class="btn" href="#/ballot">Look up my ballot</a><a class="btn ghost" href="#/michigan">Michigan races</a><button class="link-btn" id="shareLink">Share this site</button><button class="link-btn" id="clear">Clear my answers from this device</button></div>
      <p id="shareMsg" class="small" role="status"></p>
    </section>`;
  main.querySelector('#clear').addEventListener('click', () => {
    store.del(KEY); answers = Array(N).fill(null); qIndex = 0; location.hash = '#/';
  });
  main.querySelector('#shareLink').addEventListener('click', async () => {
    const url = location.origin + location.pathname;
    const msg = main.querySelector('#shareMsg');
    try {
      if (navigator.share) await navigator.share({ title: 'PoliLens', text: 'We agree on more than we’ve been told. See where you land:', url });
      else { await navigator.clipboard.writeText(url); msg.textContent = 'Link copied. Only the site link is shared, never your answers.'; }
    } catch { /* cancelled */ }
  });
}
function describeLean(v, iss) {
  if (Math.abs(v) < 0.5) return 'in the middle';
  return (Math.abs(v) >= 1.5 ? 'strongly toward ' : 'leaning toward ') + (v > 0 ? iss.pos : iss.neg).toLowerCase();
}

// ---------- ballot lookup ----------
function ballot() {
  main.innerHTML = `
    <h1>Your next election</h1>
    <p class="lede">Enter your home address to see the races and proposals on your ballot.</p>
    ${hasCivicKey() ? `
    <form class="lookup" id="lf">
      <label for="addr" class="small" style="flex-basis:100%">Street address, city, and state or ZIP</label>
      <input type="text" id="addr" autocomplete="street-address" placeholder="123 Main St, Flint, MI 48507" required>
      <button class="btn">Find my ballot</button>
    </form>
    <p class="small">Your address goes directly from your browser to Google’s Civic Information API to find your ballot. This site never sees or stores it.</p>` : `
    <div class="notice"><p>Ballot lookup isn’t switched on for this copy of the site yet. Use an official lookup below.</p></div>`}
    <div id="out" aria-live="polite"></div>
    <section>
      <h2>Official lookups</h2>
      <ul>${FALLBACK_LINKS.map((l) => `<li><a href="${l.url}" target="_blank" rel="noopener">${esc(l.title)}</a></li>`).join('')}</ul>
      <p>Voting in Michigan? <a href="#/michigan">See the statewide races and proposals side by side.</a></p>
    </section>`;
  const f = main.querySelector('#lf');
  if (!f) return;
  f.addEventListener('submit', async (e) => {
    e.preventDefault();
    const out = main.querySelector('#out');
    const btn = f.querySelector('button');
    btn.disabled = true; out.innerHTML = '<p class="small">Looking up your ballot…</p>';
    try {
      const r = await lookupBallot(main.querySelector('#addr').value.trim());
      out.innerHTML = renderBallot(r);
    } catch (err) {
      out.innerHTML = `<div class="notice warn" style="margin-top:1.5rem"><p>${esc(err.message)}</p></div>`;
    } finally { btn.disabled = false; }
  });
}
function renderBallot(r) {
  const isMI = r.state === 'MI';
  const day = r.election?.electionDay ? new Date(r.election.electionDay + 'T12:00:00').toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }) : '';
  const contests = r.contests.map((c) => {
    if (c.type === 'Referendum' || c.referendumTitle) {
      return `<div class="contest"><h3>${esc(c.referendumTitle || c.ballotTitle)}</h3>${c.referendumSubtitle ? `<p>${esc(c.referendumSubtitle)}</p>` : ''}${c.referendumUrl ? `<a href="${esc(c.referendumUrl)}" target="_blank" rel="noopener">Full text</a>` : ''}</div>`;
    }
    return `<div class="contest"><h3>${esc(c.office || c.ballotTitle)}</h3>${c.district?.name ? `<p class="small">${esc(c.district.name)}</p>` : ''}
      <ul>${(c.candidates || []).map((k) => `<li>${k.candidateUrl ? `<a href="${esc(k.candidateUrl)}" target="_blank" rel="noopener">${esc(k.name)}</a>` : esc(k.name)}${k.party ? ` <span class="small">(${esc(k.party)})</span>` : ''}</li>`).join('') || '<li class="small">Candidate list not available yet</li>'}</ul></div>`;
  }).join('');
  const poll = r.polling[0];
  return `
    <section style="margin-top:2rem">
      <h2>${esc(r.election?.name || 'Upcoming election')}</h2>
      ${day ? `<p class="lede">${esc(day)}</p>` : ''}
      ${isMI ? `<div class="notice"><p>You’re voting in Michigan. <a href="#/michigan">Compare the statewide candidates on the issues</a>.</p></div>` : ''}
      ${poll ? `<p><strong>Your polling place:</strong> ${esc(poll.address?.locationName || '')} ${esc([poll.address?.line1, poll.address?.city].filter(Boolean).join(', '))}${poll.pollingHours ? ` — ${esc(poll.pollingHours)}` : ''}</p>` : ''}
      ${contests ? `<div class="contests">${contests}</div>` : `<p>Google doesn’t have the contest list for this address yet. Your state’s official lookup below will have your sample ballot.</p>`}
      ${r.stateInfo?.electionInfoUrl ? `<p class="small" style="margin-top:1rem">Official state election info: <a href="${esc(r.stateInfo.electionInfoUrl)}" target="_blank" rel="noopener">${esc(r.stateInfo.name || 'election office')}</a></p>` : ''}
      <p class="small">Ballot data from Google’s Civic Information API and Democracy Works. Always confirm with your official sample ballot.</p>
    </section>`;
}

// ---------- Michigan races ----------
function verdict(u, s) {
  if (s == null || u == null) return null;
  if (Math.abs(u) < 0.5 || s === 0) return { cls: 'part', text: 'Partly' };
  return u * s > 0 ? { cls: 'same', text: 'Same side as you' } : { cls: 'diff', text: 'Different side' };
}
function michigan() {
  const scores = complete() ? issueScores(answers) : null;
  // Whole calendar days until Election Day, counted in Michigan time.
  const todayMI = new Date(new Date().toLocaleString('en-US', { timeZone: 'America/Detroit' }));
  todayMI.setHours(0, 0, 0, 0);
  const daysLeft = Math.round((new Date(ELECTION.date + 'T00:00:00') - todayMI) / 86400000);
  const countdown = daysLeft > 1 ? `${daysLeft} days away. ` : daysLeft === 1 ? 'Tomorrow. ' : daysLeft === 0 ? 'Today is Election Day. ' : '';
  main.innerHTML = `
    <h1>Michigan, ${esc(ELECTION.dateLabel.replace(/^\w+, /, ''))}</h1>
    <p class="lede">${countdown}${esc(ELECTION.pollHours)} ${daysLeft >= 2 ? 'Early voting and drop boxes are open now in many communities.' : 'Drop boxes stay open until 8 p.m. on Election Day.'}</p>
    <div class="row"><a class="btn" href="${ELECTION.lookup}" target="_blank" rel="noopener">See my sample ballot and polling place</a>${scores ? '' : '<a class="btn ghost" href="#/quiz">Answer the questions to compare</a>'}</div>
    <div class="notice" style="margin-top:2rem">
      <p><strong>How we built this.</strong> Candidates are listed in the same order everywhere, Democrat then Republican, alphabetically by party. Summary labels like “Tighten” or “Mostly loosen” come from <a href="https://guides.vote" target="_blank" rel="noopener">guides.vote</a>, a nonpartisan voter-guide project. We only score an issue when that guide labeled it; everything else is shown as text with its source. ${scores ? 'The “same side” tags compare those labels to your answers.' : ''} This is not an endorsement of anyone.</p>
    </div>
    ${RACES.map((r) => renderRace(r, scores)).join('')}
    <section>
      <h2>Statewide proposals</h2>
      ${PROPOSALS.map((p) => renderProp(p)).join('')}
    </section>
    <section><p class="small">Researched October 28, 2026. Found something wrong or one-sided? That matters more than anything else on this site — please tell us.</p></section>`;
}
function renderRace(r, scores) {
  const issueKeys = r.issues ? Object.keys(ISSUES).filter((k) => r.issues[k]) : [];
  const tallies = r.candidates.map((_, ci) => {
    let same = 0, compared = 0;
    if (scores) issueKeys.forEach((k) => { const v = verdict(scores[k], r.issues[k][ci].stance); if (v) { compared++; if (v.cls === 'same') same++; } });
    return { same, compared };
  });
  return `
    <section class="race">
      <h2>${esc(r.office)}</h2>
      <p>${esc(r.why)}</p>
      <div class="cands">${r.candidates.map((c, ci) => `
        <div class="cand"><h3>${esc(c.name)}</h3><div class="party">${esc(c.party)}</div><p>${esc(c.bio)}</p>
          ${c.site ? `<a class="src" href="${esc(c.site)}" target="_blank" rel="noopener">Campaign website</a>` : ''}
          ${scores && tallies[ci].compared ? `<div class="match">Same side as you on ${tallies[ci].same} of ${tallies[ci].compared} scored issues</div>` : ''}
        </div>`).join('')}
      </div>
      <p class="small">${esc(r.others)} ${src(r.othersSource)}</p>
      ${r.issues ? `
      <table class="itable">
        <thead><tr><th scope="col">Issue</th>${scores ? '<th scope="col">You</th>' : ''}${r.candidates.map((c) => `<th scope="col">${esc(c.name)}</th>`).join('')}</tr></thead>
        <tbody>${issueKeys.map((k) => `
          <tr><th scope="row">${esc(ISSUES[k].name)}</th>
            ${scores ? `<td class="yours" data-who="You">${k in scores ? esc(cap(describeLean(scores[k], ISSUES[k]))) : 'Skipped'}</td>` : ''}
            ${r.issues[k].map((p, ci) => {
              const v = scores ? verdict(scores[k], p.stance) : null;
              return `<td data-who="${esc(r.candidates[ci].name)}">${p.label ? `<span class="lbl">${esc(p.label)}</span>` : ''}${esc(p.text)}${v ? `<br><span class="verdict ${v.cls}">${v.text}</span>` : ''}${src(p.src)}</td>`;
            }).join('')}
          </tr>`).join('')}
        </tbody>
      </table>
      ${r.extra ? `<p style="margin-top:1rem">${esc(r.extra.text)} ${src(r.extra.src)}</p>` : ''}` : `
      <p class="sources">Sources: ${r.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('; ')}</p>`}
    </section>`;
}
const cap = (s) => s.charAt(0).toUpperCase() + s.slice(1);
function renderProp(p) {
  const qi = p.related ? QUESTIONS.findIndex((q) => q.id === p.related) : -1;
  const yours = qi >= 0 && answers[qi] != null ? `<p class="small">On our related question (“${esc(QUESTIONS[qi].text)}”) you answered: ${scaleLabel(answers[qi])}.</p>` : '';
  return `
    <div class="prop">
      <h3>${esc(p.title)}</h3>
      <p>${esc(p.question)}</p>
      <dl>
        <dt>A yes vote</dt><dd>${esc(p.yes)}</dd>
        <dt>A no vote</dt><dd>${esc(p.no)}</dd>
        <dt>Supporters say</dt><dd>${esc(p.for)}</dd>
        <dt>Opponents say</dt><dd>${esc(p.against)}</dd>
      </dl>
      ${yours}
      <p class="sources">Sources: ${p.sources.map((s) => `<a href="${esc(s.url)}" target="_blank" rel="noopener">${esc(s.title)}</a>`).join('; ')}</p>
    </div>`;
}

// ---------- about ----------
function about() {
  main.innerHTML = `
    <div class="prose" style="max-width:var(--measure)">
      <h1>How this works</h1>
      <p class="lede">This site exists to test one idea: that ordinary people agree on more than the news, the parties, and social media make it look like.</p>
      <h2>What we store</h2>
      <p>When you finish and leave the box checked, we save your ${N} answers as a short string of digits, plus your state if you chose one. That’s it. No name, email, address, IP address, location, or tracking cookie. We can’t tell who you are, so we can’t delete a single person’s answers either — uncheck the box if you’d rather not be counted.</p>
      <p>Your answers are also kept in your own browser so you can come back to your results. “Clear my answers” on the results page removes them.</p>
      <p>The ballot lookup sends your address straight from your browser to Google’s Civic Information API. It never reaches us.</p>
      <h2>How the questions are written</h2>
      <p>Each statement is something a reasonable person could agree or disagree with. About half are worded so that “agree” is the usual left-of-center answer and half so it’s the usual right-of-center answer, which keeps people who agree with everything from looking like one side. We avoid loaded words. Some questions are ones polls show broad agreement on, and some are ones that split people sharply. Both kinds are real.</p>
      <h2>How the comparisons work</h2>
      <p>“Most people agree with you” counts only people who took a side, not people who answered “not sure.” “The people least like you” means the half of recent respondents whose answers match yours the least. Anyone can take the questions, so the totals describe the people who came here, not a scientific sample of the country.</p>
      <h2>How candidates are described</h2>
      <p>Candidate positions come from nonpartisan voter guides and news coverage, with a link on every claim. We only score a candidate on an issue when <a href="https://guides.vote" target="_blank" rel="noopener">guides.vote</a> gave a summary label for it. Candidates are always listed in the same fixed order, never ranked by how well they match you. We don’t endorse anyone.</p>
      <h2>Check our work</h2>
      <p>Every question, candidate summary, and source lives in plain files in the site\u2019s code. If something is wrong or tilted, tell us and we\u2019ll fix it.</p>
    </div>`;
}

route();
