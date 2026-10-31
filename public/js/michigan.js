// Michigan general election, Tuesday Nov 3, 2026 — statewide races & proposals.
// Last researched: Oct 28, 2026.
//
// HOW STANCES ARE SCORED (shown to users on the page):
//   We only score a candidate on an issue when guides.vote — a nonpartisan
//   voter-guide project — gave that candidate a summary label on it.
//   Full label ("Legal", "Tighten", "Increase", "Easier", "Expand", "Yes",
//   "Raise", "Ban", "Harder", "Lower", "No") = ±2.  "Mostly ..." = ±1.
//   "Mixed" = 0.  No label / "Unclear" = null (not scored; text only).
//   The sign follows the axis definitions in questions.js (ISSUES).
//   Everything else is shown as text with its source, never scored.

export const ELECTION = {
  name: 'Michigan general election',
  date: '2026-11-03',
  dateLabel: 'Tuesday, November 3, 2026',
  pollHours: 'Polls are open 7 a.m. to 8 p.m.',
  lookup: 'https://mvic.sos.state.mi.us/',
  howToVote: 'https://www.michigan.gov/vote',
};

const GUIDE_GOV = { title: 'guides.vote — Michigan Governor guide', url: 'https://guides.vote/wp-content/uploads/2026/09/Michigan-Governor-Guide-2026.pdf' };
const GUIDE_SEN = { title: 'guides.vote — Michigan U.S. Senate guide', url: 'https://guides.vote/?p=5672' };
const MPR_DEBATE1 = { title: 'Michigan Public — first governor debate, Oct 6', url: 'https://www.michiganpublic.org/politics-government/2026-10-07/james-distances-himself-from-trump-as-benson-tries-to-connect-them-in-gubernatorial-debate' };
const MPR_DEBATE2 = { title: 'Michigan Public — second governor debate', url: 'https://www.michiganpublic.org/politics-government/2026-10-16/republican-john-james-and-democrat-jocelyn-benson-running-for-governor-debate-for-second-time' };
const WDIV_DEBATE1 = { title: 'WDIV — Benson, James first debate', url: 'https://www.clickondetroit.com/news/local/2026/10/07/benson-james-offer-contrasting-visions-in-first-michigan-governor-debate/' };
const MULTISTATE = { title: 'MultiState — Michigan governor race', url: 'https://www.multistate.us/elections/governor-race/michigan-2026' };
const SEN_DEBATE = { title: 'Scripps — Michigan Senate debate takeaways', url: 'https://www.wxyz.com/politics/america-votes/trump-tariffs-and-health-care-takeaways-from-two-senate-debates' };
const NW_SEN = { title: 'Newsweek — Rogers, El-Sayed first debate', url: 'https://www.newsweek.com/mike-rogers-abdul-el-sayed-first-debate-michigan-12543810' };

export const RACES = [
  {
    id: 'governor',
    office: 'Governor',
    why: 'Open seat — Gov. Gretchen Whitmer is term-limited. The governor signs or vetoes state laws, proposes the state budget, and runs state agencies.',
    candidates: [
      { name: 'Jocelyn Benson', party: 'Democratic', bio: 'Michigan Secretary of State since 2019. Running mate: Winnie Brinks.', site: 'https://jocelynbenson.com' },
      { name: 'John James', party: 'Republican', bio: 'U.S. Representative (10th District), Army veteran and businessman. Running mate: Jay DeBoyer.', site: 'https://johnjamesmi.com' },
    ],
    others: 'Also on the ballot: Anthony Hudson (Libertarian), Douglas Campbell (Green), and Donna Brandenburg (U.S. Taxpayers), per MultiState. Your sample ballot has the official list.',
    othersSource: MULTISTATE,
    issues: {
      abortion: [
        { stance: +2, label: 'Legal', text: 'Opposed overturning Roe v. Wade and backed 2022’s Proposal 3, which put abortion rights in the state constitution.', src: GUIDE_GOV },
        { stance: -2, label: 'Ban', text: 'Called himself "100% pro-life" in 2018. His position on rape and incest exceptions has shifted over time; in 2024 he said Michigan voters had already settled the question with Proposal 3.', src: GUIDE_GOV },
      ],
      climate: [
        { stance: +2, label: 'Yes', text: 'Calls climate solutions an economic opportunity; supported the state law setting 100% clean electricity by 2040.', src: GUIDE_GOV },
        { stance: -1, label: 'Mostly no', text: 'Has called the 100%-clean-by-2040 law "insane" and promises to repeal the clean energy mandate. Voted to end some federal clean-energy tax credits, though in 2025 he called for extending others.', src: GUIDE_GOV },
      ],
      environment: [
        { stance: +2, label: 'Tighten', text: 'Wants higher penalties for corporate polluters and enforceable protections for the Great Lakes.', src: GUIDE_GOV },
        { stance: -1, label: 'Mostly loosen', text: 'Sponsored a bill to overturn stricter EPA car-emission rules and voted to narrow the Clean Water Act; also opposes nuclear waste storage in the Great Lakes basin and won federal money for Lake St. Clair sewers.', src: GUIDE_GOV },
      ],
      guns: [
        { stance: +2, label: 'Tighten', text: 'Supported Michigan’s package of red-flag, universal background check, and safe-storage laws.', src: GUIDE_GOV },
        { stance: -1, label: 'Mostly loosen', text: 'Says the Second Amendment is "not up for negotiation" and sponsored concealed-carry reciprocity; also proposed incentives for buying gun safes and in 2019 called expanded background checks reasonable to consider.', src: GUIDE_GOV },
      ],
      healthcare: [
        { stance: +2, label: 'Increase', text: 'Calls health care a right; wants more low- or no-cost preventive care, medical debt relief, and a $5,000 caregiver tax credit.', src: GUIDE_GOV },
        { stance: -1, label: 'Mostly decrease', text: 'Says the fix is less government, not more. Voted against a three-year ACA subsidy extension; supports Medicaid work requirements and wider rural health access.', src: GUIDE_GOV },
      ],
      schoolchoice: [
        { stance: null, label: 'Unclear', text: 'Opposes policies that pull money from neighborhood public schools; supports charter schools held to the same standards.', src: GUIDE_GOV },
        { stance: +2, label: 'Yes', text: 'Would opt Michigan into the new federal tax-credit program for private-school scholarships on his first day.', src: GUIDE_GOV },
      ],
      labor: [
        { stance: +2, label: 'Easier', text: 'Says unions built Michigan’s middle class; supports collective bargaining and unemployment benefits for striking workers.', src: GUIDE_GOV },
        { stance: 0, label: 'Mixed', text: 'Supports right-to-work laws, but has backed UAW members’ pay and joined a nurses’ picket line at Henry Ford Genesys.', src: GUIDE_GOV },
      ],
      lgbtq: [
        { stance: +2, label: 'Expand', text: 'Supported adding sexual orientation and gender identity to state anti-discrimination law.', src: GUIDE_GOV },
        { stance: -1, label: 'Mostly limit', text: 'Voted to bar transgender athletes from girls’ and women’s sports and to criminalize gender-affirming care for minors; said in 2018 that employers shouldn’t be able to fire someone for being gay.', src: GUIDE_GOV },
      ],
      voting: [
        { stance: +2, label: 'Easier', text: 'Supports a state Voting Rights Act; opposes proof-of-citizenship requirements for registration.', src: GUIDE_GOV },
        { stance: -2, label: 'Harder', text: 'Supports requiring proof of citizenship and photo ID at the polls, and auditing voter rolls.', src: GUIDE_GOV },
      ],
      taxes: [
        { stance: null, text: 'Won’t raise middle-class taxes; proposes a down-payment tax credit for homebuyers. Said in the first debate she would support suspending the state gas tax.', src: MPR_DEBATE1 },
        { stance: null, text: 'Wants to phase out the state income tax, starting with a 25% cut to the 4.25% rate in his first year, plus property tax reform.', src: MULTISTATE },
      ],
      immigration: [
        { stance: null, text: 'Opposes ICE enforcement that she says harms community safety; criticized withholding funds from sanctuary cities.', src: GUIDE_GOV },
        { stance: null, text: 'Voted for more ICE and border funding, more border wall, and E-Verify for new hires; opposes sanctuary cities.', src: GUIDE_GOV },
      ],
      justice: [
        { stance: null, text: 'Started a program to get newly paroled people state IDs; says the focus should be economic opportunity rather than policing poverty.', src: GUIDE_GOV },
        { stance: null, text: 'Promises officers more training, equipment, and legal protections, and wants to remove judges he says release violent offenders.', src: GUIDE_GOV },
      ],
      trade: [
        { stance: null, text: 'Calls the federal tariffs on Canada the "John James Tax" and says they cost Michigan households more than any other state.', src: WDIV_DEBATE1 },
        { stance: null, text: 'Says he never voted to raise tariffs on Canada and has pressed the administration to negotiate a fair deal.', src: WDIV_DEBATE1 },
      ],
      local: [
        { stance: null, text: 'Favors stricter guardrails on data centers to protect the environment and keep nearby residents from paying higher electric bills.', src: MPR_DEBATE2 },
        { stance: null, text: 'Would change state law so communities could reject data centers they don’t want.', src: MPR_DEBATE2 },
      ],
    },
  },
  {
    id: 'senate',
    office: 'U.S. Senate',
    why: 'Open seat — Sen. Gary Peters is retiring. Ratings groups call it a toss-up, and it could decide which party controls the Senate.',
    candidates: [
      { name: 'Abdul El-Sayed', party: 'Democratic', bio: 'Physician and epidemiologist; former Detroit health director and Wayne County health, human and veterans services director.', site: null },
      { name: 'Mike Rogers', party: 'Republican', bio: 'Former U.S. Representative (2001–2015) and House Intelligence Committee chair; Army veteran and former FBI agent.', site: null },
    ],
    others: 'Third-party and write-in candidates may also appear. Check your sample ballot.',
    othersSource: null,
    issues: {
      abortion: [
        { stance: +2, label: 'Legal', text: 'Would push to put the protections of Roe v. Wade into federal law.', src: GUIDE_SEN },
        { stance: 0, label: 'Mixed', text: 'Describes himself as pro-life and supported overturning Roe, but opposes a national ban and says he will respect Michigan voters’ decision.', src: GUIDE_SEN },
      ],
      climate: [
        { stance: +2, label: 'Yes', text: 'Calls climate change a present crisis and supports a path to 100% renewable energy.', src: GUIDE_SEN },
        { stance: -2, label: 'No', text: 'Says EV and renewable mandates are hurting Michigan’s auto industry and costing families.', src: GUIDE_SEN },
      ],
      environment: [
        { stance: +2, label: 'Tighten', text: 'Wants polluters held accountable and supports shutting down the Line 5 pipeline.', src: GUIDE_SEN },
        { stance: 0, label: 'Mixed', text: 'Supports a ban on Great Lakes drilling and moving Line 5 out from under the lake, but voted in 2014 to limit EPA Clean Water Act enforcement.', src: GUIDE_SEN },
      ],
      guns: [
        { stance: +2, label: 'Tighten', text: 'Supported red-flag laws and would ban weapons he describes as built for war.', src: GUIDE_SEN },
        { stance: 0, label: 'Mixed', text: 'Says bans won’t curb violence; favors addressing mental illness, enforcing current laws, and background checks.', src: GUIDE_SEN },
      ],
      healthcare: [
        { stance: +2, label: 'Increase', text: 'Supports Medicare for All and erasing medical debt; wants to reverse recent Medicaid and ACA subsidy cuts.', src: GUIDE_SEN },
        { stance: -1, label: 'Mostly decrease', text: 'Prefers a free-market plan and opposes Medicare for All; voted against the ACA but says he wants to reform it.', src: GUIDE_SEN },
      ],
      schoolchoice: [
        { stance: -2, label: 'No', text: 'Opposes vouchers that he says privatize public education.', src: GUIDE_SEN },
        { stance: +2, label: 'Yes', text: 'Wants Michigan to join the federal private-school scholarship tax-credit program; says families need choices.', src: GUIDE_SEN },
      ],
      labor: [
        { stance: +2, label: 'Easier', text: 'Would pass the PRO Act and says right-to-work laws should be illegal.', src: GUIDE_SEN },
        { stance: 0, label: 'Mixed', text: 'Voiced support for the 2023 UAW strike, but voted in 2013–2014 to limit prevailing-wage rules and the NLRB.', src: GUIDE_SEN },
      ],
      lgbtq: [
        { stance: +2, label: 'Expand', text: 'Supports guaranteed civil rights protections, including in health care.', src: GUIDE_SEN },
        { stance: 0, label: 'Mixed', text: 'Says people shouldn’t be fired or evicted for being LGBTQ and now accepts same-sex marriage as law; opposes transgender athletes in women’s sports.', src: GUIDE_SEN },
      ],
      voting: [
        { stance: +2, label: 'Easier', text: 'Opposes voter ID requirements and the SAVE Act; supports making Election Day a holiday.', src: GUIDE_SEN },
        { stance: -2, label: 'Harder', text: 'Supports voter ID and the SAVE Act’s proof-of-citizenship rules; has concerns about verifying mail ballots.', src: GUIDE_SEN },
      ],
      taxes: [
        { stance: +2, label: 'Raise', text: 'Would raise rates on income over $1 million and add a wealth tax on billionaires.', src: GUIDE_SEN },
        { stance: -2, label: 'Lower', text: 'Supports the 2025 tax-cut law and would consider lowering the corporate rate further.', src: GUIDE_SEN },
      ],
      minwage: [
        { stance: +2, label: 'Yes', text: 'Supports raising wages, including a $60,000 minimum teacher salary.', src: GUIDE_SEN },
        { stance: null, label: 'No recent position', text: 'No recent stated position; voted against the 2007 federal minimum wage increase.', src: GUIDE_SEN },
      ],
      economy: [
        { stance: +1, label: 'Mostly increase', text: 'Wants more antitrust enforcement against monopolies and public investment in small business and housing.', src: GUIDE_SEN },
        { stance: -1, label: 'Mostly decrease', text: 'Blames excessive regulation for high housing costs; wants tax credits for home builders.', src: GUIDE_SEN },
      ],
      military: [
        { stance: -2, label: 'No', text: 'Wants an immediate end to the war with Iran and diplomacy to keep Iran from getting nuclear weapons.', src: GUIDE_SEN },
        { stance: +2, label: 'Yes', text: 'Calls Iran an imminent threat, is comfortable giving the president authority to continue, and wants a quick conclusion.', src: GUIDE_SEN },
      ],
      immigration: [
        { stance: null, text: 'Supports a secure border and a path to citizenship; supports abolishing ICE and replacing it with a new enforcement structure.', src: GUIDE_SEN },
        { stance: null, text: 'Wants to finish the border wall and restore Remain in Mexico; favors targeting criminals over mass deportation.', src: GUIDE_SEN },
      ],
      justice: [
        { stance: null, text: 'Opposes cash bail and backs police recruitment funding plus community violence prevention.', src: GUIDE_SEN },
        { stance: null, text: 'Promises to back police with more resources and restore "law and order."', src: GUIDE_SEN },
      ],
      trade: [
        { stance: null, text: 'Accuses Rogers of changing positions on tariffs for political reasons.', src: NW_SEN },
        { stance: null, text: 'Released an ad criticizing the administration’s tariff fight with Canada.', src: NW_SEN },
      ],
      local: [
        { stance: null, text: 'Says data center deals must include protections for water and the environment.', src: GUIDE_SEN },
        { stance: null, text: 'Calls for local control over data centers.', src: GUIDE_SEN },
      ],
    },
    extra: { text: 'On Social Security, El-Sayed wants to raise the cap on income subject to the payroll tax; Rogers says lawmakers should work together on a fix but has not laid out a plan.', src: SEN_DEBATE },
  },
  {
    id: 'ag',
    office: 'Attorney General',
    why: 'Open seat — Dana Nessel is term-limited. The AG is the state’s top lawyer: consumer protection, defending state laws, and suing or defending against the federal government.',
    candidates: [
      { name: 'Eli Savit', party: 'Democratic', bio: 'Washtenaw County Prosecutor since 2021; former clerk for two U.S. Supreme Court justices. Has pursued criminal-justice reforms and says he’d focus on serious crime, voting rights, and polluters.', site: null },
      { name: 'Doug Lloyd', party: 'Republican', bio: 'Eaton County Prosecutor for 13 years and president of the Michigan Prosecutors Association. Favors a traditional approach to prosecution and criticizes what he calls politically motivated lawsuits by the current AG.', site: null },
    ],
    others: 'Also on the ballot: Jason Dye (Libertarian). Check your sample ballot for the full list.',
    sources: [
      { title: 'Axios Detroit — AG and SOS candidates', url: 'https://www.axios.com/local/detroit/2026/10/19/michigan-attorney-general-secretary-state-2026-guide' },
      { title: 'WDIV — what to know about the AG candidates', url: 'https://clickondetroit.com/news/local/2026/05/25/what-to-know-about-the-candidates-running-for-michigan-attorney-general-in-2026-election' },
    ],
    issues: null,
  },
  {
    id: 'sos',
    office: 'Secretary of State',
    why: 'Open seat — Jocelyn Benson is running for governor. The secretary of state runs elections (including Michigan’s 2028 presidential vote) and handles driver’s licenses and vehicle registration.',
    candidates: [
      { name: 'Garlin Gilchrist II', party: 'Democratic', bio: 'Lieutenant Governor since 2019 and former Microsoft software engineer. Says he’d protect Michigan elections from federal overreach, guard voter data privacy, and modernize licensing.', site: null },
      { name: 'Anthony Forlini', party: 'Republican', bio: 'Macomb County Clerk since 2021 and former state representative. Says he’d clean up voter rolls, increase transparency, and make branch offices easier to use.', site: null },
    ],
    others: 'Three other candidates are also on the ballot. Check your sample ballot for the full list.',
    sources: [
      { title: 'Votebeat — where the SOS candidates stand', url: 'https://www.votebeat.org/michigan/2026/10/08/garlin-gilchrist-anthony-forlini-secretary-of-state-2026-election/' },
      { title: 'Ballotpedia News — Gilchrist, Forlini', url: 'https://news.ballotpedia.org/2026/08/27/gilchrist-forlini-seek-open-michigan-secretary-of-state-seat-as-benson-runs-for-governor/' },
    ],
    issues: null,
  },
];

export const PROPOSALS = [
  {
    id: 'prop1',
    title: 'Proposal 1: Constitutional convention',
    question: 'Should Michigan elect delegates in 2027 to draft a general revision of the state constitution, which voters would then approve or reject?',
    yes: 'Starts the process: partisan elections for 148 delegates, a convention starting in October 2027, and a later statewide vote on whatever they propose.',
    no: 'Keeps the 1963 constitution. Specific amendments can still be made through the Legislature or citizen petitions. The question returns automatically in 2042.',
    for: 'Supporters, including some Republican legislative leaders, say the state has changed a lot since 1963 and a full review is overdue.',
    against: 'An unusually broad coalition — the Michigan Chamber, AFL-CIO, Michigan Education Association, League of Women Voters, and former officials from both parties — says it would be costly, slow, and invite years of uncertainty.',
    related: null,
    sources: [
      { title: 'Votebeat — Proposal 1 explained', url: 'https://www.votebeat.org/michigan/2026/07/09/constitutional-convention-concon-proposal-1-explained/' },
      { title: 'Michigan Advance — opportunity vs. uncertainty', url: 'https://michiganadvance.com/?p=113892' },
      { title: 'Michigan Chamber — coalition opposing Prop 1', url: 'https://www.michamber.com/news/business-labor-democracy-groups-unite-in-opposition-to-constitutional-convention/' },
    ],
  },
  {
    id: 'prop2',
    title: 'Proposal 2: Utility and contractor donations',
    question: 'Should regulated gas and electric utilities, companies with more than $250,000 a year in government contracts, and people closely tied to them be banned from contributing to candidates for offices that affect them — and should disclosure rules cover more political ads?',
    yes: 'Bans those contributions and requires donor disclosure for more political ads, including online ads that name a candidate or ballot question.',
    no: 'Keeps current law, which allows these contributions within existing limits.',
    for: 'Supporters (Michiganders for Money Out of Politics) say utilities and big contractors use donations to influence the officials who regulate them, driving up rates.',
    against: 'Opponents (Protect MI Free Speech, DTE Energy) say it would bar ordinary people with family or business ties from supporting candidates, raises First Amendment problems, and leaves out-of-state money untouched.',
    related: 'gov_utilities',
    sources: [
      { title: 'WDIV — supporters and opponents clash', url: 'https://clickondetroit.com/news/local/2026/10/17/michigan-proposal-2-aims-to-limit-corporate-money-in-politics-supporters-opponents-clash/' },
      { title: 'Michigan Advance — Citizens Research Council analysis', url: 'https://michiganadvance.com/2026/09/29/citizens-research-council-outlines-impacts-of-mop-up-michigan-initiative/' },
    ],
  },
];
