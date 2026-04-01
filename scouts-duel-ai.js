/* ═══════════════════════════════════════════════════════════════════
   Football Genius — Scout's Duel AI  (Gemini via Supabase Edge Function)
   ═══════════════════════════════════════════════════════════════════ */
(() => {
  'use strict';

  const SUPABASE_URL = 'https://deojsgulvlyvskztfgfc.supabase.co';
  const EDGE_FN_URL = SUPABASE_URL + '/functions/v1/gemini-proxy';

  /**
   * Call Gemini via Supabase Edge Function proxy.
   * Requires the user to be authenticated (uses their JWT).
   */
  async function callGemini(prompt) {
    let token = '';
    try {
      const session = await window.auth?.getSession();
      token = session?.access_token || '';
    } catch (_) { /* continue without token */ }

    const res = await fetch(EDGE_FN_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + token,
      },
      body: JSON.stringify({ prompt }),
    });

    if (!res.ok) throw new Error('Gemini proxy returned ' + res.status);
    const data = await res.json();
    return (data.text || '').trim();
  }

  /**
   * Answer a free-text question about a given player using Gemini.
   * Falls back to "I'm not sure" → "No" if the API is unavailable.
   */
  async function answerFreeText(questionText, player) {
    const prompt = [
      `You are playing a footballer guessing game. Your secretly chosen player is ${player.name}.`,
      `Key facts: ${player.nationality}, plays ${player.position} for ${player.club || 'Retired'}.`,
      `${player.isRetired ? 'The player is retired.' : 'The player is currently active.'}`,
      `Footedness: ${player.footedness}. Ballon d'Or: ${player.ballonDor ? 'Yes' : 'No'}.`,
      `World Cup winner: ${player.worldCupWinner ? 'Yes' : 'No'}.`,
      `Champions League winner: ${player.clWinner ? 'Yes' : 'No'}.`,
      '',
      `The opponent asks: "${questionText}"`,
      '',
      'Answer ONLY with "Yes" or "No" — nothing else. Base your answer on commonly known football facts about this player.',
    ].join('\n');

    try {
      const reply = await callGemini(prompt);
      // Parse: look for "Yes" or "No" in the response
      const lower = reply.toLowerCase();
      if (lower.includes('yes')) return 'Yes';
      if (lower.includes('no')) return 'No';
      return 'No'; // default
    } catch (err) {
      console.warn('[ScoutsDuelAI] Gemini call failed:', err);
      // Fallback: try to answer from known attributes
      return fallbackAnswer(questionText, player);
    }
  }

  /**
   * Keyword-based fallback when Gemini is unavailable.
   */
  function fallbackAnswer(questionText, player) {
    const q = questionText.toLowerCase();

    // Position
    if (q.includes('forward') || q.includes('striker')) return player.position === 'FW' ? 'Yes' : 'No';
    if (q.includes('midfielder')) return player.position === 'MF' ? 'Yes' : 'No';
    if (q.includes('defender')) return player.position === 'DF' ? 'Yes' : 'No';
    if (q.includes('goalkeeper') || q.includes('keeper')) return player.position === 'GK' ? 'Yes' : 'No';

    // Nationality
    if (q.includes('europe')) return player.continent === 'Europe' ? 'Yes' : 'No';
    if (q.includes('south america')) return player.continent === 'South America' ? 'Yes' : 'No';
    if (q.includes('africa')) return player.continent === 'Africa' ? 'Yes' : 'No';

    // Leagues
    if (q.includes('premier league')) return player.premierLeague ? 'Yes' : 'No';
    if (q.includes('la liga')) return player.laLiga ? 'Yes' : 'No';
    if (q.includes('serie a')) return player.serieA ? 'Yes' : 'No';
    if (q.includes('bundesliga')) return player.bundesliga ? 'Yes' : 'No';
    if (q.includes('ligue 1')) return player.ligue1 ? 'Yes' : 'No';

    // Status
    if (q.includes('retired')) return player.isRetired ? 'Yes' : 'No';
    if (q.includes('active')) return !player.isRetired ? 'Yes' : 'No';

    // Achievements
    if (q.includes("ballon d'or") || q.includes('ballon dor')) return player.ballonDor ? 'Yes' : 'No';
    if (q.includes('world cup')) return player.worldCupWinner ? 'Yes' : 'No';
    if (q.includes('champions league')) return player.clWinner ? 'Yes' : 'No';

    // Physical
    if (q.includes('left-footed') || q.includes('left foot')) return player.footedness === 'left' ? 'Yes' : 'No';
    if (q.includes('right-footed') || q.includes('right foot')) return player.footedness === 'right' ? 'Yes' : 'No';

    // Age
    if (q.includes('under 25')) return player.ageRange === 'under25' ? 'Yes' : 'No';
    if (q.includes('over 35') || q.includes('35+')) return player.ageRange === '35+' ? 'Yes' : 'No';
    if (q.includes('over 30')) return (player.ageRange === '31-35' || player.ageRange === '35+') ? 'Yes' : 'No';

    // Default: 50/50
    return Math.random() > 0.5 ? 'Yes' : 'No';
  }

  // Expose
  window.ScoutsDuelAI = { answerFreeText, callGemini };
})();
