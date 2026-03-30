/**
 * Football Genius — One-Time Data Migration to Supabase
 * =====================================================
 * Reads all 3 JSON data files and inserts them into Supabase tables.
 *
 * Prerequisites:
 *   1. Run the SQL schema (supabase-schema.sql) in Supabase SQL Editor first.
 *   2. Set environment variables:
 *        SUPABASE_URL=https://deojsgulvlyvskztfgfc.supabase.co
 *        SUPABASE_SERVICE_ROLE_KEY=<your-service-role-key>
 *
 * Usage:
 *   cd scripts
 *   npm install
 *   node migrate-to-supabase.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// ─── Config ───────────────────────────────────────────────────────
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://deojsgulvlyvskztfgfc.supabase.co';
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_KEY) {
  console.error('❌ SUPABASE_SERVICE_ROLE_KEY environment variable is required.');
  console.error('   Get it from: Supabase Dashboard → Settings → API → service_role key');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const DATA_DIR = path.join(__dirname, '..', 'data');

// ─── Transfermarkt ID Mapping ─────────────────────────────────────
// Manually mapped for the ~40 players in players.json
const TRANSFERMARKT_IDS = {
  'messi': 28003,
  'ronaldo': 8198,
  'mbappe': 342229,
  'haaland': 418560,
  'bellingham': 581678,
  'neymar': 68290,
  'lewandowski': 38253,
  'benzema': 18922,
  'modric': 27992,
  'bruyne': 88755,
  'zlatan': 3455,
  'rooney': 3332,
  'henry': 3207,
  'drogba': 3924,
  'lampard': 3163,
  'salah': 148455,
  'kane': 132098,
  'vinicius': 371998,
  'valverde': 369081,
  'rodri': 357565,
  'bernardo': 241641,
  'foden': 406635,
  'palmer': 629498,
  'saka': 433177,
  'saliba': 495765,
  'musiala': 580195,
  'wirtz': 625483,
  'yamal': 943085,
  'kimmich': 161056,
  'kroos': 31909,
  'rudiger': 86202,
  'vandijk': 139208,
  'isak': 402471,
  'raphinha': 411295,
  'dembele': 288230,
  'joaoneves': 966498,
  'vitinha': 490760,
  'alisson': 105470,
  'rodrygo': 412363,
  'valverde2': 369081,
  'valverde3': 369081,
};

// Transfermarkt IDs for guess players (by name)
const GUESS_TRANSFERMARKT_IDS = {
  'Cristiano Ronaldo': 8198,
  'Lionel Messi': 28003,
  'Kylian Mbappé': 342229,
  'Erling Haaland': 418560,
  'Neymar Jr': 68290,
  'Vinícius Júnior': 371998,
  'Jude Bellingham': 581678,
  'Mohamed Salah': 148455,
  'Kevin De Bruyne': 88755,
  'Robert Lewandowski': 38253,
  'Luka Modrić': 27992,
  'Karim Benzema': 18922,
  'Zlatan Ibrahimović': 3455,
  'Didier Drogba': 3924,
  'Wayne Rooney': 3332,
  'Thierry Henry': 3207,
  'Frank Lampard': 3163,
  'Gareth Bale': 39381,
  'Harry Kane': 132098,
  'Toni Kroos': 31909,
  'Bukayo Saka': 433177,
  'Cole Palmer': 629498,
  'Phil Foden': 406635,
  'Pedri': 901307,
  'Gavi': 855544,
  'Lamine Yamal': 943085,
  'Florian Wirtz': 625483,
  'Jamal Musiala': 580195,
  'Rodri': 357565,
  'William Saliba': 495765,
  'Declan Rice': 326031,
  'Virgil van Dijk': 139208,
  'Joshua Kimmich': 161056,
  'Bernardo Silva': 241641,
  'Rafael Leão': 460927,
  'Raphinha': 411295,
  'Antoine Griezmann': 125037,
  'Federico Valverde': 369081,
  'Ousmane Dembélé': 288230,
  'Alexander Isak': 402471,
  'Viktor Gyökeres': 430923,
  'Alejandro Garnacho': 862008,
  'Julián Álvarez': 643205,
  'Benjamin Šeško': 710498,
  'Antonio Rüdiger': 86202,
  'Alisson Becker': 105470,
  'Matheus Cunha': 476498,
  'Vitinha': 490760,
  'Johan Cruyff': null, // retired / historical
};

// ─── Migration Functions ──────────────────────────────────────────

async function migrateGlobalPlayers() {
  console.log('\n📊 Migrating global_players...');
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'players.json'), 'utf8'));

  const rows = raw.map(p => ({
    id: p.id,
    name: p.name,
    image: p.image,
    career_goals: p.stats?.careerGoals || 0,
    career_trophies: p.stats?.careerTrophies || 0,
    market_value: p.stats?.marketValue || 0,
    transfer_from: p.stats?.transfer?.from || null,
    transfer_to: p.stats?.transfer?.to || null,
    transfer_fee: p.stats?.transfer?.fee || 0,
    transfermarkt_id: TRANSFERMARKT_IDS[p.id] || null,
  }));

  const { data, error } = await supabase
    .from('global_players')
    .upsert(rows, { onConflict: 'id' });

  if (error) {
    console.error('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Inserted/updated ${rows.length} global players`);
  }
}

async function migrateGuessPlayers() {
  console.log('\n🎯 Migrating guess_players...');
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'guess-players.json'), 'utf8'));

  const rows = raw.map(p => ({
    name: p.name,
    image: p.image,
    club: p.club,
    nation: p.nation,
    transfermarkt_id: GUESS_TRANSFERMARKT_IDS[p.name] || null,
  }));

  // Clear existing data first (since we use SERIAL id)
  await supabase.from('guess_players').delete().neq('id', 0);

  const { data, error } = await supabase
    .from('guess_players')
    .insert(rows);

  if (error) {
    console.error('  ❌ Error:', error.message);
  } else {
    console.log(`  ✅ Inserted ${rows.length} guess players`);
  }
}

async function migrateGridPlayers() {
  console.log('\n🏟️  Migrating grid_players...');
  const raw = JSON.parse(fs.readFileSync(path.join(DATA_DIR, 'grid-players.json'), 'utf8'));

  const rows = raw.map(p => ({
    name: p.name || '',
    clubs: Array.isArray(p.clubs) ? p.clubs : [],
    nation: p.nation || '',
    stats: Array.isArray(p.stats) ? p.stats : [],
  }));

  // Clear existing data first
  await supabase.from('grid_players').delete().neq('id', 0);

  // Insert in batches of 100 (Supabase limit)
  const BATCH_SIZE = 100;
  let inserted = 0;
  for (let i = 0; i < rows.length; i += BATCH_SIZE) {
    const batch = rows.slice(i, i + BATCH_SIZE);
    const { error } = await supabase
      .from('grid_players')
      .insert(batch);

    if (error) {
      console.error(`  ❌ Error at batch ${i}-${i + batch.length}:`, error.message);
    } else {
      inserted += batch.length;
    }
  }
  console.log(`  ✅ Inserted ${inserted} grid players`);
}

// ─── Main ─────────────────────────────────────────────────────────
async function main() {
  console.log('🚀 Football Genius — Data Migration to Supabase');
  console.log('   URL:', SUPABASE_URL);

  await migrateGlobalPlayers();
  await migrateGuessPlayers();
  await migrateGridPlayers();

  console.log('\n🎉 Migration complete!');
  console.log('   Verify your data at: ' + SUPABASE_URL.replace('.co', '.co/project/default/editor'));
}

main().catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
