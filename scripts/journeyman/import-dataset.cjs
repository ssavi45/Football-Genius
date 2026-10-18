// Compile the supplied collection without trusting its claimed release status.
const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const sharp = require('sharp');
const root = path.resolve(__dirname, '../..');
const read = file => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const digest = bytes => crypto.createHash('sha256').update(bytes).digest('hex');
const normalize = value => value.normalize('NFKD').replace(/\p{M}/gu, '').toLowerCase().replace(/[^\p{L}\p{N}]/gu, '');

async function main() {
  const source = read('src/data/journeyman-careers.json');
  const catalog = read('src/data/journeyman-clubs.json');
  const review = read('scripts/journeyman/import-review.json');
  const ids = new Set(source.players.map(p => p.id));
  if (source.schemaVersion !== 1 || source.players.length !== 300 || ids.size !== 300) throw Error('Expected 300 distinct canonical identities.');
  const aliases = new Map(review.equivalentClubIds.flatMap(group => group.map(id => [id, group[0]])));
  const fingerprints = new Map();
  for (const p of source.players) {
    const key = p.clubs.map(c => aliases.get(c.clubId) || c.clubId).join('|');
    const group = fingerprints.get(key) || [];
    group.push(p.id); fingerprints.set(key, group);
  }
  const badgeIssues = new Map();
  for (const [id, club] of Object.entries(catalog)) {
    const issues = [];
    const provenance = club.badgeProvenance || {};
    if (/procedural|placeholder|generic shield/i.test(provenance.source || '')) issues.push('generated-placeholder-badge');
    if (review.blockedClubBadges[id] && review.resolvedClubBadges?.[id]?.sha256 !== provenance.sha256) issues.push('wrong-club-badge');
    if (club.badge === null && club.badgeUnavailable === true && provenance.unavailable === true && review.unavailableClubBadges?.[id]) {
      // A documented missing historical crest is displayed honestly as text.
    } else if (!/^img\/journeyman\/clubs\/[a-z0-9_-]+\.webp$/.test(club.badge || '')) {
      issues.push('invalid-badge-path');
    } else {
      const asset = path.join(root, 'public', club.badge);
      try {
        const bytes = fs.readFileSync(asset);
        const image = await sharp(bytes).metadata();
        if (image.format !== 'webp' || image.width !== 180 || image.height !== 180 || !image.hasAlpha) issues.push('invalid-badge-format');
        if (!provenance.sha256 || digest(bytes) !== provenance.sha256) issues.push('badge-hash-mismatch');
      } catch { issues.push('missing-or-invalid-badge'); }
    }
    if (issues.length) badgeIssues.set(id, issues);
  }
  const reviews = [];
  const runtime = source.players.map(p => {
    const reasons = [];
    if (p.puzzleEligible !== true) reasons.push('source-ineligible');
    if (p.clubs.length < 3) reasons.push('fewer-than-three-stints');
    const fingerprint = p.clubs.map(c => aliases.get(c.clubId) || c.clubId).join('|');
    if (p.ambiguityGroup || fingerprints.get(fingerprint).length > 1) reasons.push('ambiguous-full-trail');
    p.clubs.forEach((c, index) => {
      if (!catalog[c.clubId] || c.order !== index + 1 || !c.hasVerifiedAppearance || c.seniorCompetitiveAppearances === 0 || (c.seniorCompetitiveAppearances !== null && (!Number.isInteger(c.seniorCompetitiveAppearances) || c.seniorCompetitiveAppearances < 0))) reasons.push(`invalid-stint:${index + 1}`);
      if (catalog[c.clubId] && c.logo !== catalog[c.clubId].badge) reasons.push(`badge-path-mismatch:${c.clubId}`);
      if (badgeIssues.has(c.clubId)) for (const reason of badgeIssues.get(c.clubId)) reasons.push(`${reason}:${c.clubId}`);
      if (index > 0 && (aliases.get(c.clubId) || c.clubId) === (aliases.get(p.clubs[index - 1].clubId) || p.clubs[index - 1].clubId)) reasons.push('consecutive-duplicate-stint');
      if (c.from && c.to && c.from > c.to) reasons.push(`reversed-stint-dates:${index + 1}`);
      if (c.from && c.from > source.snapshotAsOf.slice(0, c.from.length)) reasons.push(`future-stint:${index + 1}`);
    });
    const uniqueReasons = [...new Set(reasons)];
    reviews.push({ id: p.id, name: p.name, enabled: uniqueReasons.length === 0, reasons: uniqueReasons });
    return {
      id: p.id, name: p.name, status: p.status,
      aliases: [...new Set(p.aliases)].filter(a => normalize(a) && normalize(a) !== normalize(p.name)),
      clubs: p.clubs.map(c => ({ clubId: c.clubId, label: c.label, logo: c.logo })),
      puzzleEligible: uniqueReasons.length === 0,
    };
  });
  const enabled = runtime.filter(p => p.puzzleEligible);
  if (enabled.length < 10) throw Error('Fewer than ten usable question records remain.');
  const report = {
    status: 'CONNECTED_WITH_QUARANTINED_RECORDS',
    factualVerification: 'NOT_ESTABLISHED_BY_SUPPLIED_EVIDENCE',
    note: 'Passing these structural and asset checks is not an independent verification of every historical career. The original candidate used generic site-homepage citations; the targeted career corrections now include supporting page URLs.',
    sourceSnapshotAsOf: source.snapshotAsOf,
    contentVersion: digest(JSON.stringify({ source, catalog, review })),
    totalPlayers: runtime.length, enabledQuestions: enabled.length,
    withheldQuestions: runtime.length - enabled.length,
    sourceIncompleteCareers: source.players.filter(p => !p.careerComplete).length,
    eligibilityPolicy: 'Career completion and retirement are not required. careerComplete is informational only.',
    blockedBadges: Object.fromEntries(badgeIssues),
    unavailableBadges: review.unavailableClubBadges || {},
    contradictedClaims: review.contradictedClaims,
    players: reviews,
  };
  if (process.argv.includes('--check')) {
    const actual = read('src/data/transfer-players.json');
    if (JSON.stringify(actual) !== JSON.stringify(runtime)) throw Error('Runtime export is stale. Run npm run build:journeyman.');
    const actualReport = read('scripts/journeyman/IMPORT_REPORT.json');
    if (actualReport.contentVersion !== report.contentVersion || actualReport.enabledQuestions !== report.enabledQuestions) throw Error('Import report is stale.');
  } else {
    fs.writeFileSync(path.join(root, 'src/data/transfer-players.json'), `${JSON.stringify(runtime, null, 2)}\n`);
    fs.writeFileSync(path.join(root, 'scripts/journeyman/IMPORT_REPORT.json'), `${JSON.stringify(report, null, 2)}\n`);
    const candidate = path.join(root, 'tmp/journeyman/transfer-players.candidate.json');
    if (fs.existsSync(candidate)) fs.writeFileSync(candidate, `${JSON.stringify(runtime, null, 2)}\n`);
  }
  console.log(`${runtime.length} career records connected; ${enabled.length} questions enabled; ${runtime.length - enabled.length} withheld. Full factual verification remains outstanding.`);
}
main().catch(error => { console.error(error.message); process.exitCode = 1; });
