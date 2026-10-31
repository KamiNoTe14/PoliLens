// Ballot lookup through Google's Civic Information API (data from Democracy Works).
// The address goes straight from the browser to Google and is never sent to,
// or stored by, this site.
import { CONFIG } from './config.js';

export const hasCivicKey = () => Boolean(CONFIG.civicApiKey);

export async function lookupBallot(address) {
  const url = new URL('https://www.googleapis.com/civicinfo/v2/voterinfo');
  url.searchParams.set('key', CONFIG.civicApiKey);
  url.searchParams.set('address', address);
  url.searchParams.set('returnAllAvailableData', 'true');
  const res = await fetch(url, { referrerPolicy: 'strict-origin' });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const reason = body?.error?.errors?.[0]?.reason || '';
    if (reason === 'notFound' || res.status === 400) {
      throw new Error('No upcoming election data was found for that address. Check the spelling, or use your state’s official lookup below.');
    }
    throw new Error('The ballot lookup service didn’t respond. Try again, or use your state’s official lookup below.');
  }
  return {
    election: body.election || null,
    state: body.normalizedInput?.state || '',
    contests: body.contests || [],
    polling: body.pollingLocations || [],
    early: body.earlyVoteSites || [],
    dropoff: body.dropOffLocations || [],
    stateInfo: body.state?.[0]?.electionAdministrationBody || null,
  };
}

// Official lookup tools by state for when the API has nothing.
export const FALLBACK_LINKS = [
  { title: 'Michigan Voter Information Center (sample ballot, polling place)', url: 'https://mvic.sos.state.mi.us/' },
  { title: 'Vote411 from the League of Women Voters (any state)', url: 'https://www.vote411.org/ballot' },
  { title: 'Can I Vote? from the National Association of Secretaries of State', url: 'https://www.nass.org/can-I-vote' },
];
