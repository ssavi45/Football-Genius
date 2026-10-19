import { createHash } from 'node:crypto';
import raw from '@/data/scouts-duel-players.json';
import snapshot from '@/data/higher-lower-snapshot.json';
import careers from '@/data/journeyman-careers.json';
import profiles from '@/data/journeyman-profiles.json';
import portraits from '../../../public/img/higher-lower/asset-sources.json';
import corrections from '@/data/scouts-duel-corrections.json';
import scoutPortraits from '@/data/scouts-duel-portraits.json';
import type { ScoutPlayer } from './types';

const normalize = (s: string) => s.normalize('NFKD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^a-z0-9]/g,'');
export const SCOUT_AS_OF = snapshot.createdAt.slice(0,10);
const local = (s: string) => `/${s.replace(/^\//,'')}`;
const portraitAliases: Record<string,string> = { van_dijk:'vandijk', silva:'bernardo', joao_neves:'joaoneves' };
const knownLeagues: Record<string,string> = { 'Bayern Munich':'Bundesliga', 'Real Madrid':'La Liga', 'Barcelona':'La Liga', 'Liverpool':'Premier League', 'Chelsea':'Premier League', 'Arsenal':'Premier League', 'Man City':'Premier League', 'Manchester City':'Premier League', 'Man Utd':'Premier League', 'Inter':'Serie A', 'AC Milan':'Serie A', 'Juventus':'Serie A', 'PSG':'Ligue 1', 'LA Galaxy':'MLS', 'Vancouver Whitecaps':'MLS', 'Fenerbahçe':'Süper Lig', 'Girona':'La Liga' };
const scoutRecords: ScoutPlayer[] = raw.map(p => {
  const correction = (corrections.players as Record<string,Partial<ScoutPlayer>>)[p.id] || {};
  const career = careers.players.find(c => normalize(c.name) === normalize(p.name) || c.aliases.some(a => normalize(a) === normalize(p.name)));
  const current = snapshot.players.find(c => c.id === p.id || normalize(c.name) === normalize(p.name));
  const profile = career ? (profiles as Record<string,{portrait:string;cutout:boolean}>)[career.id] : undefined;
  const portraitId = current ? portraitAliases[current.id] || current.id : p.id;
  const headshot = portraits.portraits.find(c => c.name === portraitId && c.alpha);
  const dob = current?.dateOfBirth || career?.dateOfBirth;
  const age = dob ? Number(SCOUT_AS_OF.slice(0,4)) - Number(dob.slice(0,4)) - (SCOUT_AS_OF.slice(5) < dob.slice(5) ? 1 : 0) : null;
  const retired = correction.isRetired ?? current?.isRetired ?? p.isRetired;
  const club = retired ? 'Retired' : current?.club || p.club;
  return { id:p.id, name:p.name, image:headshot ? `/img/higher-lower/players/${portraitId}.png` : profile?.portrait || local(p.image),
    nationality:p.nationality, nationalityFlag:local(p.nationalityFlag), continent:p.continent,
    club, clubBadge:retired ? '/img/icons/retired.png' : current?.clubId ? `/img/higher-lower/clubs/${current.clubId}.png` : p.club === club && p.clubBadge ? local(p.clubBadge) : null,
    league:retired ? null : current?.league || knownLeagues[club] || p.league,
    position:p.position as ScoutPlayer['position'], footedness:correction.footedness || p.footedness as ScoutPlayer['footedness'],
    isRetired:retired, age, ballonDor:correction.ballonDor ?? p.ballonDor, worldCupWinner:p.worldCupWinner, clWinner:correction.clWinner ?? p.clWinner,
    pastClubs:career ? [...new Set(career.clubs.map(c => c.label))] : null,
  };
});
export const scoutPlayers: ScoutPlayer[] = scoutRecords.map(player=>({...player,image:(scoutPortraits as Record<string,string>)[player.id]||player.image}));
export const scoutById = new Map(scoutPlayers.map(p=>[p.id,p]));
// Portrait presentation updates must not invalidate an in-progress duel.
export const SCOUT_DATASET_VERSION = createHash('sha256').update(JSON.stringify(scoutRecords)).digest('hex').slice(0,16);
