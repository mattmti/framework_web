const axios = require('axios');
const pool = require('../config/db');

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';

// 2 plus grands clubs × 6 pays = 12 équipes — saison 2025/2026
// On importe les 11 joueurs titulaires (triés par minutes jouées)
const TOP_TEAMS = [
  // ── 🇫🇷 Ligue 1 (France) ──────────────────────────────────────────────────
  { id: 85,  name: 'Paris Saint-Germain', league: 'Ligue 1',        country: 'France' },
  { id: 81,  name: 'Marseille',           league: 'Ligue 1',        country: 'France' },

  // ── 🏴󠁧󠁢󠁥󠁮󠁧󠁿 Premier League (Angleterre) ────────────────────────────────────────
  { id: 50,  name: 'Manchester City',     league: 'Premier League', country: 'England' },
  { id: 40,  name: 'Liverpool',           league: 'Premier League', country: 'England' },

  // ── 🇪🇸 La Liga (Espagne) ─────────────────────────────────────────────────
  { id: 541, name: 'Real Madrid',         league: 'La Liga',        country: 'Spain' },
  { id: 529, name: 'Barcelona',           league: 'La Liga',        country: 'Spain' },

  // ── 🇮🇹 Serie A (Italie) ──────────────────────────────────────────────────
  { id: 505, name: 'Inter Milan',         league: 'Serie A',        country: 'Italy' },
  { id: 496, name: 'Juventus',            league: 'Serie A',        country: 'Italy' },

  // ── 🇩🇪 Bundesliga (Allemagne) ────────────────────────────────────────────
  { id: 157, name: 'Bayern Munich',       league: 'Bundesliga',     country: 'Germany' },
  { id: 165, name: 'Borussia Dortmund',   league: 'Bundesliga',     country: 'Germany' },

  // ── 🇳🇱 Eredivisie (Pays-Bas) ─────────────────────────────────────────────
  { id: 194, name: 'Ajax',                league: 'Eredivisie',     country: 'Netherlands' },
  { id: 197, name: 'PSV Eindhoven',       league: 'Eredivisie',     country: 'Netherlands' },
];

// Nombre de joueurs titulaires à conserver par équipe
const STARTERS_PER_TEAM = 11;

// Délai entre chaque appel API (7s) pour respecter la limite de 10 req/min
const API_DELAY_MS = 7000;
const sleep = (ms) => new Promise(r => setTimeout(r, ms));

// Appel générique vers api-sports.io avec détection du rate-limit
const apiRequest = async (endpoint, params = {}) => {
  const response = await axios.get(`${FOOTBALL_API_BASE}/${endpoint}`, {
    headers: { 'x-apisports-key': FOOTBALL_API_KEY },
    params,
  });
  const data = response.data;
  // L'API renvoie 200 même en cas de rate-limit, avec errors.requests renseigné
  if (data.errors?.requests) {
    throw new Error(`Rate limit API: ${data.errors.requests}`);
  }
  return data;
};

// POST /api/players/import-top — Import des 11 titulaires de chaque équipe (admin uniquement)
// = 24 requêtes API (12 × /players/squads + 12 × /players) → ~132 joueurs au total
const importTopPlayers = async (req, res) => {
  if (!FOOTBALL_API_KEY) {
    return res.status(500).json({ error: 'Clé API football non configurée' });
  }

  const season = req.body.season || 2024; // 2024 = saison 2024/2025
  let totalAdded = 0;
  let totalUpdated = 0;
  let totalApiRequests = 0;
  const errors = [];
  const teamsSummary = [];

  for (const team of TOP_TEAMS) {
    try {
      console.log(`📡 Import ${team.name} (saison ${season})...`);

      // ── Étape 1 : /players/squads → numéros de maillot fiables ──────────
      // Cet endpoint retourne directement player.number (toujours renseigné)
      const squadData = await apiRequest('players/squads', { team: team.id });
      totalApiRequests++;
      await sleep(API_DELAY_MS); // respecter le rate-limit (10 req/min)

      // Construire une map { playerId → shirtNumber } depuis le squad
      const shirtNumberMap = {};
      if (squadData.response?.[0]?.players) {
        for (const p of squadData.response[0].players) {
          if (p.id != null && p.number != null) {
            shirtNumberMap[p.id] = p.number;
          }
        }
      }
      console.log(`   📋 Squad chargé — ${Object.keys(shirtNumberMap).length} numéros de maillot récupérés`);

      // ── Étape 2 : /players → stats de la saison (tri par minutes jouées) ─
      const data = await apiRequest('players', {
        team: team.id,
        season,
        page: 1,
      });
      totalApiRequests++;
      await sleep(API_DELAY_MS); // respecter le rate-limit (10 req/min)

      if (!data.response || data.response.length === 0) {
        console.warn(`⚠️  Aucun joueur retourné pour ${team.name}`);
        errors.push(`${team.name}: aucun joueur retourné par l'API`);
        continue;
      }

      // ── Trier par minutes jouées (desc) pour identifier les 11 titulaires ─
      const sorted = data.response
        .filter(item => item.player && item.statistics?.[0])
        .sort((a, b) => {
          const minA = a.statistics[0].games?.minutes ?? 0;
          const minB = b.statistics[0].games?.minutes ?? 0;
          return minB - minA;
        });

      const starters = sorted.slice(0, STARTERS_PER_TEAM);

      let teamAdded = 0;
      let teamUpdated = 0;

      for (const item of starters) {
        const player = item.player;
        const stats  = item.statistics[0];

        const age        = player.age;
        // Numéro de maillot : priorité à /players/squads (fiable), fallback sur stats
        const shirtNumber = shirtNumberMap[player.id]
          ?? stats.games?.number
          ?? stats.games?.shirtnumber
          ?? null;
        const position   = stats.games?.position || player.position || null;
        const club       = stats.team?.name || team.name;
        const leagueName = stats.league?.name || team.league;
        const photoUrl   = player.photo
          || `https://media.api-sports.io/football/players/${player.id}.png`;

        const result = await pool.query(
          `INSERT INTO players
             (api_id, name, age, shirt_number, position, league, nationality, club, photo_url, season, imported_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
           ON CONFLICT (api_id) DO UPDATE SET
             name         = EXCLUDED.name,
             age          = EXCLUDED.age,
             shirt_number = EXCLUDED.shirt_number,
             position     = EXCLUDED.position,
             league       = EXCLUDED.league,
             nationality  = EXCLUDED.nationality,
             club         = EXCLUDED.club,
             photo_url    = EXCLUDED.photo_url,
             season       = EXCLUDED.season,
             imported_at  = NOW()
           RETURNING (xmax = 0) AS inserted`,
          [
            player.id,
            player.name,
            age,
            shirtNumber,
            position,
            leagueName,
            player.nationality,
            club,
            photoUrl,
            season,
          ]
        );

        if (result.rows[0]?.inserted) { totalAdded++; teamAdded++; }
        else { totalUpdated++; teamUpdated++; }
      }

      teamsSummary.push({
        team: team.name,
        country: team.country,
        starters_imported: starters.length,
        added: teamAdded,
        updated: teamUpdated,
      });
      console.log(`✅ ${team.name} — ${starters.length} titulaires importés`);

    } catch (err) {
      console.error(`❌ Erreur import ${team.name}:`, err.message);
      errors.push(`${team.name}: ${err.message}`);
    }
  }

  res.json({
    message: `Import ${season}/${season + 1} terminé — ${STARTERS_PER_TEAM} titulaires par équipe`,
    season,
    teams_processed: teamsSummary.length,
    added: totalAdded,
    updated: totalUpdated,
    api_requests_used: totalApiRequests,
    teams: teamsSummary,
    errors: errors.length > 0 ? errors : undefined,
  });
};

// GET /api/players — Liste paginée
const getPlayers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT id, name, age, shirt_number, position, league, nationality, club, photo_url
                 FROM players`;
    let countQuery = `SELECT COUNT(*) FROM players`;
    const params = [];

    if (search) {
      query += ` WHERE unaccent(name) ILIKE unaccent($1)`;
      countQuery += ` WHERE unaccent(name) ILIKE unaccent($1)`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY name LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const [playersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    res.json({
      players: playersResult.rows,
      total: parseInt(countResult.rows[0].count),
      page: parseInt(page),
      totalPages: Math.ceil(countResult.rows[0].count / limit),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/players/daily — Joueur du jour (sans révéler qui c'est)
const getDailyPlayerInfo = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];
    const result = await pool.query(
      `SELECT p.photo_url
       FROM daily_players dp
       JOIN players p ON p.id = dp.player_id
       WHERE dp.game_date = $1`,
      [today]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Aucun joueur quotidien' });
    }

    res.json({ has_daily_player: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { importTopPlayers, getPlayers, getDailyPlayerInfo };
