import type { ScoutPlayer, ScoutQuestion, Category } from './types';

export const CATEGORIES: Category[] = ['Position', 'Region', 'League', 'Status', 'Awards', 'Physical'];
export const normalizeScoutText = (s: string) => s.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[’']/g, '').replace(/[^a-z0-9 ]/g, ' ').replace(/\s+/g, ' ').trim();
export function evaluateScoutQuestion(p: ScoutPlayer, q: ScoutQuestion): boolean | null {
  switch (q.kind) {
    case 'position': return p.position === q.value;
    case 'nation': return p.nationality === q.value;
    case 'continent': return p.continent === q.value;
    case 'league': return p.league === q.value;
    case 'club': return !p.isRetired && p.club === q.value;
    case 'pastClub': return p.pastClubs ? p.pastClubs.some(c => normalizeScoutText(c) === normalizeScoutText(q.value)) : null;
    case 'status': return q.value === 'retired' ? p.isRetired : !p.isRetired;
    case 'foot': return p.footedness === q.value;
    case 'age': return p.age === null ? null : q.value === 'over30' ? p.age > 30 : p.age <= 25;
    case 'award': return q.value === 'ucl' ? p.clWinner : q.value === 'world-cup' ? p.worldCupWinner : p.ballonDor;
  }
}
export function scoutQuestions(board: ScoutPlayer[]): ScoutQuestion[] {
  const all: ScoutQuestion[] = [];
  const add = (category: Category, kind: ScoutQuestion['kind'], value: string, text: string) => all.push({ id: `${kind}:${value}`, category, kind, value, text });
  for (const [position, label] of [['GK','goalkeeper'],['DF','defender'],['MF','midfielder'],['FW','forward']]) add('Position','position',position,`Is he a ${label}?`);
  for (const continent of [...new Set(board.map(p => p.continent))].sort()) add('Region','continent',continent,`Is he from ${continent}?`);
  for (const nation of [...new Set(board.map(p => p.nationality))].sort()) add('Region','nation',nation,`Does he represent ${nation}?`);
  for (const league of [...new Set(board.flatMap(p => p.league ? [p.league] : []))].sort()) add('League','league',league,`Does he currently play in ${league}?`);
  for (const club of [...new Set(board.filter(p => !p.isRetired).map(p => p.club))].sort()) add('League','club',club,`Does he currently play for ${club}?`);
  for (const club of [...new Set(board.flatMap(p => p.pastClubs || []))].sort()) add('League','pastClub',club,`Has he played for ${club}?`);
  add('Status','status','active','Is he currently active?'); add('Status','status','retired','Is he retired?');
  add('Status','age','over30','Is he over 30 years old?'); add('Status','age','25orunder','Is he 25 or younger?');
  add('Awards','award','ucl','Has he won the Champions League?'); add('Awards','award','world-cup','Has he won the World Cup?'); add('Awards','award','ballon-dor',"Has he won the Ballon d’Or?");
  for (const foot of ['left','right','both']) add('Physical','foot',foot,foot === 'both' ? 'Is he two-footed?' : `Is he ${foot}-footed?`);
  // An unanswered field must never be silently treated as NO.
  return all.filter(q => board.every(p => evaluateScoutQuestion(p,q) !== null));
}
export function parseScoutQuestion(text: string, questions: ScoutQuestion[]): ScoutQuestion | null {
  const query = normalizeScoutText(text);
  const exact = questions.find(q => normalizeScoutText(q.text) === query);
  if (exact) return exact;
  if (/\b(not|never|except|or|and)\b/.test(query)) return null;
  const aliases: Record<string,string[]> = {
    'position:FW':['is your player a forward'], 'position:MF':['is he a midfielder','is your player a midfielder'],
    'position:DF':['is he a defender','is your player a defender'], 'position:GK':['is he a keeper','is your player a goalkeeper'],
    'award:ucl':['has he won the ucl','has he won a champions league'], 'award:world-cup':['is he a world cup winner'],
    'status:retired':['is your player retired'], 'foot:left':['is he left footed'], 'foot:right':['is he right footed'],
  };
  const mapped = Object.entries(aliases).find(([, values]) => values.includes(query));
  if (mapped) return questions.find(q => q.id === mapped[0]) || null;
  const history = query.match(/^(?:did he ever play for|did he play for|has he played for) (.+)$/);
  if (history) return questions.find(q => q.kind === 'pastClub' && normalizeScoutText(q.value) === history[1]) || null;
  const nation = query.match(/^(?:does he play for|is he from) (.+)$/);
  if (nation) return questions.find(q => ['nation','continent'].includes(q.kind) && normalizeScoutText(q.value) === nation[1]) || null;
  return null;
}
