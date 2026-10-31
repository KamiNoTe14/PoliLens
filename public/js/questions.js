// Question set. Changing wording, order, or count = bump QUESTION_SET_VERSION,
// because stored answers are positional.
//
// Each question sits on an issue axis. `sign` says which way "agree" moves you
// on that axis (+1 = toward the axis's positive pole, -1 = away from it).
// Wording rules we hold ourselves to:
//   - Every statement must be something a reasonable person could agree OR
//     disagree with without sounding foolish.
//   - Roughly half the statements lean each way on the usual left/right
//     spectrum, so "agree with everything" doesn't put you on one side.
//   - No loaded adjectives ("radical", "common-sense", "extreme").

export const QUESTION_SET_VERSION = 1;

// Positive pole of each axis, in plain words. Used on results pages.
export const ISSUES = {
  abortion:     { name: 'Abortion',                 pos: 'Keep abortion legal',              neg: 'Restrict abortion' },
  guns:         { name: 'Gun laws',                 pos: 'Tighten gun laws',                 neg: 'Loosen gun laws' },
  healthcare:   { name: 'Health care',              pos: 'More government role',             neg: 'Less government role' },
  immigration:  { name: 'Immigration',              pos: 'Stricter enforcement',             neg: 'More legal pathways' },
  climate:      { name: 'Climate & energy',         pos: 'Make climate a top priority',      neg: 'Keep energy cheap first' },
  environment:  { name: 'Environmental rules',      pos: 'Tighten regulation',               neg: 'Loosen regulation' },
  schoolchoice: { name: 'School funding',           pos: 'Public money can follow students to private schools', neg: 'Public money stays in public schools' },
  taxes:        { name: 'Taxes',                    pos: 'Raise taxes on top earners',       neg: 'Cut taxes broadly' },
  labor:        { name: 'Unions & labor',           pos: 'Make organizing easier',           neg: 'Keep organizing rules as they are or tighter' },
  minwage:      { name: 'Minimum wage',             pos: 'Raise it',                         neg: 'Leave it to the market' },
  voting:       { name: 'Voting rules',             pos: 'Make voting easier',               neg: 'Add more verification' },
  lgbtq:        { name: 'LGBTQ policy',             pos: 'Expand protections',               neg: 'Limit some policies' },
  justice:      { name: 'Criminal justice',         pos: 'Reform the system',                neg: 'Strengthen enforcement' },
  economy:      { name: 'Regulation & the economy', pos: 'Bigger government role',           neg: 'Fewer regulations' },
  trade:        { name: 'Trade',                    pos: 'Fewer tariffs',                    neg: 'More tariffs' },
  military:     { name: 'Iran war',                 pos: 'Continue military action',         neg: 'End it now' },
  government:   { name: 'Money & ethics in government', pos: 'Stricter limits on officials and donors', neg: 'Fewer limits' },
  local:        { name: 'Local control',            pos: 'Communities decide',               neg: 'State decides' },
};

export const QUESTIONS = [
  { id: 'abortion_legal', issue: 'abortion', sign: +1,
    text: 'Abortion should be legal in all or most cases.' },
  { id: 'guns_background', issue: 'guns', sign: +1,
    text: 'Every gun sale, including private sales between individuals, should require a background check.' },
  { id: 'guns_burden', issue: 'guns', sign: -1,
    text: 'New gun restrictions mostly burden law-abiding owners instead of stopping criminals.' },
  { id: 'health_guarantee', issue: 'healthcare', sign: +1,
    text: 'The federal government should make sure every American has health coverage.' },
  { id: 'health_workreq', issue: 'healthcare', sign: -1,
    text: 'Adults on Medicaid who are able to work should be required to work, volunteer, or be in job training.' },
  { id: 'imm_path', issue: 'immigration', sign: -1,
    text: 'Undocumented immigrants who have lived here for years without committing crimes should have a way to gain legal status.' },
  { id: 'imm_wall', issue: 'immigration', sign: +1,
    text: 'The U.S. should finish building a barrier along the southern border.' },
  { id: 'climate_priority', issue: 'climate', sign: +1,
    text: 'Fighting climate change should be a top priority, even if it raises some energy costs.' },
  { id: 'env_toostrict', issue: 'environment', sign: -1,
    text: 'Pollution rules for businesses are already strict enough or too strict.' },
  { id: 'school_vouchers', issue: 'schoolchoice', sign: +1,
    text: 'Families should be able to use public education money to send their kids to private or religious schools.' },
  { id: 'tax_millionaires', issue: 'taxes', sign: +1,
    text: 'People who earn more than $1 million a year should pay a higher tax rate than they do now.' },
  { id: 'tax_income', issue: 'taxes', sign: -1,
    text: 'Michigan should phase out its state income tax.' },
  { id: 'labor_unions', issue: 'labor', sign: +1,
    text: 'It should be easier for workers to form a union.' },
  { id: 'minwage_raise', issue: 'minwage', sign: +1,
    text: 'The minimum wage should be raised.' },
  { id: 'vote_id', issue: 'voting', sign: -1,
    text: 'Voters should have to show a photo ID to vote in person.' },
  { id: 'vote_mail', issue: 'voting', sign: +1,
    text: 'Every voter should be able to vote early or by mail without needing an excuse.' },
  { id: 'lgbtq_jobs', issue: 'lgbtq', sign: +1,
    text: 'Employers should not be allowed to fire someone for being gay or transgender.' },
  { id: 'lgbtq_sports', issue: 'lgbtq', sign: +1,
    text: 'Transgender girls should be allowed to play on girls’ school sports teams.' },
  { id: 'justice_bail', issue: 'justice', sign: +1,
    text: 'People accused of nonviolent crimes shouldn’t have to pay cash bail to stay out of jail before trial.' },
  { id: 'justice_police', issue: 'justice', sign: -1,
    text: 'Most police departments need more funding and officers.' },
  { id: 'econ_housing', issue: 'economy', sign: -1,
    text: 'Cutting regulations is the best way to bring down housing costs.' },
  { id: 'trade_tariffs', issue: 'trade', sign: +1,
    text: 'Broad tariffs on imported goods do Michigan more harm than good.' },
  { id: 'military_iran', issue: 'military', sign: -1,
    text: 'The U.S. should end its military action against Iran as soon as possible.' },
  { id: 'gov_stocks', issue: 'government', sign: +1,
    text: 'Members of Congress should be banned from trading individual stocks.' },
  { id: 'gov_utilities', issue: 'government', sign: +1,
    text: 'Utility companies regulated by the state should be banned from donating to political campaigns.' },
  { id: 'local_datacenters', issue: 'local', sign: +1,
    text: 'Local communities should have the final say on whether a large data center gets built there.' },
];

// Answer scale. Stored as the digit 0-4; "x" = skipped.
export const SCALE = [
  { v: 0, label: 'Strongly disagree' },
  { v: 1, label: 'Disagree' },
  { v: 2, label: 'Not sure / mixed' },
  { v: 3, label: 'Agree' },
  { v: 4, label: 'Strongly agree' },
];

// Convert a stored answer (0-4) to agreement strength -2..+2.
export const agreeScore = (d) => d - 2;

// Where the user sits on each issue axis: average of signed answers, -2..+2.
export function issueScores(answers) {
  const sums = {}, counts = {};
  QUESTIONS.forEach((q, i) => {
    const a = answers[i];
    if (a === 'x' || a == null) return;
    const s = q.sign * agreeScore(Number(a));
    sums[q.issue] = (sums[q.issue] || 0) + s;
    counts[q.issue] = (counts[q.issue] || 0) + 1;
  });
  const out = {};
  for (const k in sums) out[k] = sums[k] / counts[k];
  return out;
}
