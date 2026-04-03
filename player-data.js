/**
 * Football Genius — Player Data Layer
 * ====================================
 * Fetches player data from Supabase with localStorage caching.
 * Falls back to local JSON files if Supabase is unreachable.
 *
 * Usage:
 *   const players = await window.PlayerData.getGlobalPlayers();
 *   const guessPlayers = await window.PlayerData.getGuessPlayers();
 *   const gridPlayers = await window.PlayerData.getGridPlayers();
 *   const transferPlayers = await window.PlayerData.getTransferPlayers();
 */

(function () {
  'use strict';

  // ─── Supabase Configuration ─────────────────────────────────────
  const SUPABASE_URL = 'https://deojsgulvlyvskztfgfc.supabase.co';
  const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRlb2pzZ3Vsdmx5dnNrenRmZ2ZjIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzM3MTg4MzgsImV4cCI6MjA4OTI5NDgzOH0.owPzJWrabPU_Jm_W_I2mJ6BkOIodFKUFe6J6kUKfDJ4';

  // REST API base for lightweight fetch (no SDK needed)
  const REST_BASE = SUPABASE_URL + '/rest/v1';
  const HEADERS = {
    'apikey': SUPABASE_ANON_KEY,
    'Authorization': 'Bearer ' + SUPABASE_ANON_KEY,
    'Content-Type': 'application/json',
  };

  // ─── Cache Settings ─────────────────────────────────────────────
  const CACHE_TTL_MS = 12 * 60 * 60 * 1000; // 12 hours
  const CACHE_KEYS = {
    global: 'fg_global_players',
    guess: 'fg_guess_players',
    grid: 'fg_grid_players',
    transfer: 'fg_transfer_players',
  };

  // ─── Cache Helpers ──────────────────────────────────────────────
  function getCached(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return null;
      const parsed = JSON.parse(raw);
      if (!parsed || !parsed._cachedAt) return null;
      if (Date.now() - parsed._cachedAt > CACHE_TTL_MS) {
        localStorage.removeItem(key);
        return null;
      }
      return parsed.data;
    } catch (e) {
      return null;
    }
  }

  function setCache(key, data) {
    try {
      localStorage.setItem(key, JSON.stringify({
        _cachedAt: Date.now(),
        data: data,
      }));
    } catch (e) {
      // localStorage full or unavailable — silently ignore
    }
  }

  // ─── Supabase REST Fetch ────────────────────────────────────────
  async function supabaseSelect(table) {
    const url = REST_BASE + '/' + table + '?select=*';
    const res = await fetch(url, {
      method: 'GET',
      headers: HEADERS,
    });
    if (!res.ok) throw new Error('Supabase fetch failed: ' + res.status);
    return await res.json();
  }

  function slugifyName(name) {
    return String(name || '')
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  }

  const PLAYER_IMAGE_MAP = {
    'cristiano-ronaldo': 'img/players/ronaldo.jpg',
    'lionel-messi': 'img/players/messi.jpg',
    'neymar-jr': 'img/players/neymar.jpg',
    'kevin-de-bruyne': 'img/players/bruyne.jpg',
    'gareth-bale': 'img/players/bale.jpg'
  };

  function normalizePlayerImagePath(name, image) {
    var src = String(image || '').trim();
    var key = slugifyName(name);
    var canonical = PLAYER_IMAGE_MAP[key];
    if (/^https?:\/\//i.test(src) || src.indexOf('data:') === 0) return src;
    if (canonical) return canonical;
    if (src.indexOf('/img/') === 0) return src.slice(1);
    if (src.indexOf('img/') === 0) return src;
    if (src) return 'img/players/' + src.replace(/^\/+/, '').replace(/^players\//, '');
    return 'img/players/' + key + '.jpg';
  }

  function normalizePlayerArrayImages(rows) {
    return (rows || []).map(function (player) {
      return Object.assign({}, player, {
        image: normalizePlayerImagePath(player.name, player.image)
      });
    });
  }

  // ─── JSON Fallback Fetch ────────────────────────────────────────
  async function fetchJSON(path) {
    const res = await fetch(path + '?v=' + Date.now());
    if (!res.ok) throw new Error('JSON fetch failed: ' + res.status);
    return await res.json();
  }

  // ─── Data Transformers ──────────────────────────────────────────
  // Transform global_players DB rows → players.json shape
  function transformGlobalPlayers(rows) {
    return rows.map(function (r) {
      var obj = {
        id: r.id,
        name: r.name,
        image: normalizePlayerImagePath(r.name, r.image),
        stats: {
          careerGoals: r.career_goals,
          careerTrophies: r.career_trophies,
          marketValue: r.market_value,
        },
      };
      if (r.transfer_from || r.transfer_to) {
        obj.stats.transfer = {
          from: r.transfer_from || '',
          to: r.transfer_to || '',
          fee: r.transfer_fee || 0,
        };
      }
      return obj;
    });
  }

  // Transform guess_players DB rows → guess-players.json shape
  function transformGuessPlayers(rows) {
    return rows.map(function (r) {
      return {
        name: r.name,
        image: normalizePlayerImagePath(r.name, r.image),
        club: r.club,
        nation: r.nation,
      };
    });
  }

  // Transform grid_players DB rows → grid-players.json shape
  function transformGridPlayers(rows) {
    return rows.map(function (r) {
      return {
        name: r.name,
        clubs: r.clubs || [],
        nation: r.nation,
        stats: r.stats || [],
      };
    });
  }

  function normalizeTransferPlayers(rows) {
    return (rows || [])
      .filter(function (player) {
        return player && player.name && Array.isArray(player.clubs) && player.clubs.length >= 2;
      })
      .map(function (player) {
        return {
          name: player.name,
          aliases: Array.isArray(player.aliases) ? player.aliases : [],
          clubs: player.clubs
            .filter(function (club) {
              return club && club.label;
            })
            .map(function (club) {
              return {
                label: club.label,
                logo: club.logo || null,
              };
            }),
        };
      })
      .filter(function (player) {
        return player.clubs.length >= 2;
      });
  }

  // ─── Public API ─────────────────────────────────────────────────

  /**
   * Get global players (Higher/Lower game).
   * Returns data in the same shape as data/players.json
   */
  async function getGlobalPlayers() {
    // 1. Check cache
    var cached = getCached(CACHE_KEYS.global);
    if (cached) {
      console.log('[PlayerData] global_players loaded from cache');
      return normalizePlayerArrayImages(cached);
    }

    // 2. Try Supabase
    try {
      var rows = await supabaseSelect('global_players');
      var data = transformGlobalPlayers(rows);
      setCache(CACHE_KEYS.global, data);
      console.log('[PlayerData] global_players fetched from Supabase (' + data.length + ' rows)');
      return data;
    } catch (e) {
      console.warn('[PlayerData] Supabase failed for global_players, falling back to JSON:', e.message);
    }

    // 3. Fallback to JSON
    try {
      var jsonData = normalizePlayerArrayImages(await fetchJSON('data/players.json'));
      console.log('[PlayerData] global_players loaded from JSON fallback');
      return jsonData;
    } catch (e2) {
      console.error('[PlayerData] All sources failed for global_players:', e2.message);
      return [];
    }
  }

  /**
   * Get guess players (Guess Who game).
   * Returns data in the same shape as data/guess-players.json
   */
  async function getGuessPlayers() {
    var cached = getCached(CACHE_KEYS.guess);
    if (cached) {
      console.log('[PlayerData] guess_players loaded from cache');
      return normalizePlayerArrayImages(cached);
    }

    try {
      var rows = await supabaseSelect('guess_players');
      var data = transformGuessPlayers(rows);
      setCache(CACHE_KEYS.guess, data);
      console.log('[PlayerData] guess_players fetched from Supabase (' + data.length + ' rows)');
      return data;
    } catch (e) {
      console.warn('[PlayerData] Supabase failed for guess_players, falling back to JSON:', e.message);
    }

    try {
      var jsonData = normalizePlayerArrayImages(await fetchJSON('data/guess-players.json'));
      console.log('[PlayerData] guess_players loaded from JSON fallback');
      return jsonData;
    } catch (e2) {
      console.error('[PlayerData] All sources failed for guess_players:', e2.message);
      return [];
    }
  }

  /**
   * Get grid players (Grid Challenge game).
   * Returns data in the same shape as data/grid-players.json
   */
  async function getGridPlayers() {
    var cached = getCached(CACHE_KEYS.grid);
    if (cached) {
      console.log('[PlayerData] grid_players loaded from cache');
      return cached;
    }

    try {
      var rows = await supabaseSelect('grid_players');
      var data = transformGridPlayers(rows);
      setCache(CACHE_KEYS.grid, data);
      console.log('[PlayerData] grid_players fetched from Supabase (' + data.length + ' rows)');
      return data;
    } catch (e) {
      console.warn('[PlayerData] Supabase failed for grid_players, falling back to JSON:', e.message);
    }

    try {
      var jsonData = await fetchJSON('data/grid-players.json');
      console.log('[PlayerData] grid_players loaded from JSON fallback');
      return jsonData;
    } catch (e2) {
      console.error('[PlayerData] All sources failed for grid_players:', e2.message);
      return [];
    }
  }

  /**
   * Get transfer players (Transfer Trail game).
   * Returns data in the same shape as data/transfer-players.json
   */
  async function getTransferPlayers() {
    var cached = getCached(CACHE_KEYS.transfer);
    if (cached) {
      console.log('[PlayerData] transfer_players loaded from cache');
      return cached;
    }

    try {
      var jsonData = await fetchJSON('data/transfer-players.json');
      var data = normalizeTransferPlayers(jsonData);
      setCache(CACHE_KEYS.transfer, data);
      console.log('[PlayerData] transfer_players loaded from JSON');
      return data;
    } catch (e) {
      console.error('[PlayerData] All sources failed for transfer_players:', e.message);
      return [];
    }
  }

  /**
   * Force-clear all cached player data (e.g., for debugging).
   */
  function clearCache() {
    Object.values(CACHE_KEYS).forEach(function (key) {
      localStorage.removeItem(key);
    });
    console.log('[PlayerData] Cache cleared');
  }

  // ─── Expose on window ──────────────────────────────────────────
  window.PlayerData = {
    getGlobalPlayers: getGlobalPlayers,
    getGuessPlayers: getGuessPlayers,
    getGridPlayers: getGridPlayers,
    getTransferPlayers: getTransferPlayers,
    clearCache: clearCache,
  };
})();
