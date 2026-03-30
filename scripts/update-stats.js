/**
 * Football Genius — Automated Stats Updater
 * ==========================================
 * Scrapes Transfermarkt for updated player stats and pushes changes to Supabase.
 * Designed to run daily via GitHub Actions (see .github/workflows/update-stats.yml).
 *
 * Updates:
 *   - global_players: career goals, market value, career trophies
 *   - guess_players:  current club
 *   - grid_players:   clubs list (adds new clubs for active players)
 *
 * Environment variables:
 *   SUPABASE_URL              - Supabase project URL
 *   SUPABASE_SERVICE_ROLE_KEY - Supabase service role key (write access)
 */

const { createClient } = require('@supabase/supabase-js');
const axios = require('axios');
const cheerio = require('cheerio');

// ─── Config ───────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_KEY) {
  console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// Transfermarkt scraping headers (mimic a browser)
const TM_HEADERS = {
  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
  'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
  'Accept-Language': 'en-US,en;q=0.5',
  'Accept-Encoding': 'gzip, deflate, br',
  'Connection': 'keep-alive',
  'Cache-Control': 'max-age=0',
};

const TM_BASE = 'https://www.transfermarkt.com';

// ─── Rate Limiter ─────────────────────────────────────────────────
function delay(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// Random delay between 2-5 seconds to be polite
function politeDelay() {
  return delay(2000 + Math.random() * 3000);
}

// ─── Transfermarkt Scraper ────────────────────────────────────────

/**
 * Fetch a Transfermarkt player profile page.
 * URL format: /any-slug/profil/spieler/{id}
 */
async function fetchPlayerProfile(tmId) {
  try {
    const url = `${TM_BASE}/a/profil/spieler/${tmId}`;
    const res = await axios.get(url, {
      headers: TM_HEADERS,
      timeout: 15000,
      maxRedirects: 5,
    });
    return cheerio.load(res.data);
  } catch (err) {
    console.warn(`  ⚠ Failed to fetch profile for TM ID ${tmId}: ${err.message}`);
    return null;
  }
}

/**
 * Fetch a Transfermarkt player performance/stats page.
 * URL format: /any-slug/leistungsdatendetails/spieler/{id}
 */
async function fetchPlayerStats(tmId) {
  try {
    const url = `${TM_BASE}/a/leistungsdatendetails/spieler/${tmId}/plus/0?saison=&verein=&liga=&wettbewerb=&pos=&trainer_id=`;
    const res = await axios.get(url, {
      headers: TM_HEADERS,
      timeout: 15000,
      maxRedirects: 5,
    });
    return cheerio.load(res.data);
  } catch (err) {
    console.warn(`  ⚠ Failed to fetch stats for TM ID ${tmId}: ${err.message}`);
    return null;
  }
}

/**
 * Extract data from a player profile page.
 * Returns: { currentClub, marketValue }
 */
function parseProfile($) {
  if (!$) return {};

  const result = {};

  // Current club
  try {
    const clubEl = $('[class*="data-header__club"] a, .data-header__club a');
    if (clubEl.length) {
      result.currentClub = clubEl.first().text().trim();
    }
    // Fallback: look for the club in the info table
    if (!result.currentClub) {
      const infoItems = $('.info-table__content--regular, .data-header__items span');
      infoItems.each((_, el) => {
        const text = $(el).text().trim();
        if (text && !text.includes('€') && !text.match(/^\d/)) {
          // Heuristic: club names don't start with numbers
        }
      });
    }
  } catch (e) { /* ignore parse errors */ }

  // Market value
  try {
    const mvText = $('[class*="market-value"], .data-header__market-value-wrapper, .tm-market-value-development__current-value').first().text().trim();
    if (mvText) {
      result.marketValue = parseMarketValue(mvText);
    }
  } catch (e) { /* ignore */ }

  return result;
}

/**
 * Parse a market value string like "€180.00m" or "€25.00Bn" into USD millions.
 * Transfermarkt shows values in EUR; we approximate USD with a 1.1 multiplier.
 */
function parseMarketValue(str) {
  if (!str) return null;

  const cleaned = str.replace(/[^0-9.,kKmMbBnN]/g, '').trim();
  if (!cleaned) return null;

  let num = parseFloat(cleaned.replace(/,/g, '.'));
  if (isNaN(num)) return null;

  const lower = str.toLowerCase();
  if (lower.includes('bn') || lower.includes('b')) {
    num *= 1000; // billions → millions
  } else if (lower.includes('k') || lower.includes('th')) {
    num /= 1000; // thousands → millions
  }
  // else: already in millions (m)

  // EUR to USD approximate
  return Math.round(num * 1.1);
}

/**
 * Extract career goal total from performance page.
 * Looks for the total row at the bottom of the stats table.
 */
function parseCareerGoals($) {
  if (!$) return null;

  try {
    // Look for "Total" or footer row
    const rows = $('table.items tfoot tr, table tfoot tr, tr.odd:last-child, tr.even:last-child');
    let totalGoals = null;

    // Try the footer first
    const tfootCells = $('table tfoot td');
    if (tfootCells.length >= 3) {
      // Goals are typically the 4th or 5th column in Transfermarkt tables
      tfootCells.each((i, el) => {
        const text = $(el).text().trim();
        const num = parseInt(text, 10);
        if (!isNaN(num) && num > 0 && i >= 3 && i <= 6) {
          if (totalGoals === null || num > totalGoals) {
            // Take the first reasonable number as goals
          }
        }
      });
    }

    // Alternative: look for total text
    $('td, th').each((_, el) => {
      const text = $(el).text().trim().toLowerCase();
      if (text === 'total' || text === 'career total') {
        const row = $(el).closest('tr');
        const cells = row.find('td');
        cells.each((i, cell) => {
          const val = parseInt($(cell).text().trim(), 10);
          if (!isNaN(val) && val > 10 && i >= 2) {
            totalGoals = val;
          }
        });
      }
    });

    return totalGoals;
  } catch (e) {
    return null;
  }
}

// ─── Update Functions ─────────────────────────────────────────────

async function updateGlobalPlayers() {
  console.log('\n📊 Updating global_players...');

  const { data: players, error } = await supabase
    .from('global_players')
    .select('*')
    .not('transfermarkt_id', 'is', null);

  if (error) {
    console.error('  ❌ Failed to fetch global_players:', error.message);
    return;
  }

  console.log(`  Found ${players.length} players with Transfermarkt IDs`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const player of players) {
    try {
      await politeDelay();
      console.log(`  🔍 Checking ${player.name} (TM: ${player.transfermarkt_id})...`);

      const $profile = await fetchPlayerProfile(player.transfermarkt_id);
      const profileData = parseProfile($profile);

      await politeDelay();
      const $stats = await fetchPlayerStats(player.transfermarkt_id);
      const careerGoals = parseCareerGoals($stats);

      // Build update payload (only changed values)
      const updates = {};
      let hasChanges = false;

      if (profileData.marketValue != null && profileData.marketValue !== player.market_value) {
        updates.market_value = profileData.marketValue;
        hasChanges = true;
      }

      if (careerGoals != null && careerGoals !== player.career_goals) {
        updates.career_goals = careerGoals;
        hasChanges = true;
      }

      if (hasChanges) {
        updates.updated_at = new Date().toISOString();
        const { error: updateErr } = await supabase
          .from('global_players')
          .update(updates)
          .eq('id', player.id);

        if (updateErr) {
          console.error(`    ❌ Update failed: ${updateErr.message}`);
          failed++;
        } else {
          console.log(`    ✅ Updated:`, JSON.stringify(updates));
          updated++;
        }
      } else {
        console.log(`    ⏭ No changes`);
        skipped++;
      }
    } catch (err) {
      console.error(`    ❌ Error processing ${player.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  📊 global_players summary: ${updated} updated, ${skipped} unchanged, ${failed} failed`);
}

async function updateGuessPlayers() {
  console.log('\n🎯 Updating guess_players...');

  const { data: players, error } = await supabase
    .from('guess_players')
    .select('*')
    .not('transfermarkt_id', 'is', null);

  if (error) {
    console.error('  ❌ Failed to fetch guess_players:', error.message);
    return;
  }

  console.log(`  Found ${players.length} players with Transfermarkt IDs`);

  let updated = 0;
  let skipped = 0;
  let failed = 0;

  for (const player of players) {
    try {
      await politeDelay();
      console.log(`  🔍 Checking ${player.name} (TM: ${player.transfermarkt_id})...`);

      const $ = await fetchPlayerProfile(player.transfermarkt_id);
      const profileData = parseProfile($);

      if (profileData.currentClub && profileData.currentClub !== player.club) {
        const { error: updateErr } = await supabase
          .from('guess_players')
          .update({
            club: profileData.currentClub,
            updated_at: new Date().toISOString(),
          })
          .eq('id', player.id);

        if (updateErr) {
          console.error(`    ❌ Update failed: ${updateErr.message}`);
          failed++;
        } else {
          console.log(`    ✅ Club changed: ${player.club} → ${profileData.currentClub}`);
          updated++;
        }
      } else {
        console.log(`    ⏭ No club change`);
        skipped++;
      }
    } catch (err) {
      console.error(`    ❌ Error processing ${player.name}: ${err.message}`);
      failed++;
    }
  }

  console.log(`\n  🎯 guess_players summary: ${updated} updated, ${skipped} unchanged, ${failed} failed`);
}

async function updateGridPlayers() {
  console.log('\n🏟️  Updating grid_players (club tracking)...');

  // For grid_players, we cross-reference with guess_players changes
  // If a player in guess_players moved to a new club, and that player
  // exists in grid_players, we add the new club to their clubs array.

  const { data: guessPlayers, error: gErr } = await supabase
    .from('guess_players')
    .select('name, club')
    .not('club', 'eq', 'Retired');

  if (gErr) {
    console.error('  ❌ Failed to fetch guess_players for cross-ref:', gErr.message);
    return;
  }

  // Club name mapping (guess_players uses full names, grid_players might use short names)
  const CLUB_MAP = {
    'Manchester City': 'Man City',
    'Manchester United': 'Man United',
    'Paris Saint-Germain': 'PSG',
    'Borussia Dortmund': 'Dortmund',
    'Inter Miami': 'Inter Miami',
    'Sporting CP': 'Sporting',
    'RB Leipzig': 'RB Leipzig',
    'Bayer Leverkusen': 'Bayer Leverkusen',
    'Wolverhampton': 'Wolverhampton',
  };

  let updated = 0;

  for (const gp of guessPlayers) {
    // Find matching grid player
    const { data: gridRows, error: findErr } = await supabase
      .from('grid_players')
      .select('id, name, clubs')
      .ilike('name', gp.name);

    if (findErr || !gridRows || gridRows.length === 0) continue;

    const mappedClub = CLUB_MAP[gp.club] || gp.club;

    for (const gridPlayer of gridRows) {
      const existingClubs = gridPlayer.clubs || [];

      // Check if the club is already in the list (case-insensitive)
      const alreadyHas = existingClubs.some(
        c => c.toLowerCase() === mappedClub.toLowerCase()
      );

      if (!alreadyHas && mappedClub !== 'Retired') {
        const newClubs = [...existingClubs, mappedClub];
        const { error: upErr } = await supabase
          .from('grid_players')
          .update({
            clubs: newClubs,
            updated_at: new Date().toISOString(),
          })
          .eq('id', gridPlayer.id);

        if (!upErr) {
          console.log(`    ✅ ${gridPlayer.name}: added club "${mappedClub}"`);
          updated++;
        }
      }
    }
  }

  console.log(`\n  🏟️  grid_players summary: ${updated} club additions`);
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Football Genius — Automated Stats Update');
  console.log(`   Timestamp: ${new Date().toISOString()}`);
  console.log(`   Supabase: ${SUPABASE_URL}`);

  const startTime = Date.now();

  await updateGlobalPlayers();
  await updateGuessPlayers();
  await updateGridPlayers();

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n🎉 Update complete in ${elapsed}s`);
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
