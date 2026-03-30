const axios = require('axios');
const pool = require('../config/db');

const FOOTBALL_API_KEY = process.env.FOOTBALL_API_KEY;
const FOOTBALL_API_BASE = 'https://v3.football.api-sports.io';

// Top clubs à importer (1 requête par équipe → très économique)
const TOP_TEAMS = [
  { id: 541, name: 'Real Madrid',       league: 'La Liga',       leagueName: 'La Liga' },
  { id: 529, name: 'Barcelona',          league: 'La Liga',       leagueName: 'La Liga' },
  { id: 50,  name: 'Manchester City',    league: 'Premier League',leagueName: 'Premier League' },
  { id: 40,  name: 'Liverpool',          league: 'Premier League',leagueName: 'Premier League' },
  { id: 42,  name: 'Arsenal',            league: 'Premier League',leagueName: 'Premier League' },
  { id: 157, name: 'Bayern Munich',      league: 'Bundesliga',    leagueName: 'Bundesliga' },
  { id: 85,  name: 'Paris Saint-Germain',league: 'Ligue 1',       leagueName: 'Ligue 1' },
  { id: 505, name: 'Inter Milan',        league: 'Serie A',       leagueName: 'Serie A' },
];

// Appel générique vers football-api.com
const apiRequest = async (endpoint, params = {}) => {
  const response = await axios.get(`${FOOTBALL_API_BASE}/${endpoint}`, {
    headers: {
      'x-apisports-key': FOOTBALL_API_KEY,
    },
    params,
  });
  return response.data;
};

// POST /api/players/import-top — Import des top joueurs (admin uniquement)
// Utilise 1 requête par équipe → max 8 requêtes API pour ~160 joueurs top mondiaux
const importTopPlayers = async (req, res) => {
  if (!FOOTBALL_API_KEY) {
    return res.status(500).json({ error: 'Clé API football non configurée' });
  }

  const season = req.body.season || 2024;
  let totalAdded = 0;
  let totalUpdated = 0;
  const errors = [];

  for (const team of TOP_TEAMS) {
    try {
      console.log(`📡 Import ${team.name} (saison ${season})...`);

      const data = await apiRequest('players', {
        team: team.id,
        season,
        page: 1,
      });

      if (!data.response || data.response.length === 0) {
        console.warn(`⚠️  Aucun joueur pour ${team.name}`);
        continue;
      }

      for (const item of data.response) {
        const player = item.player;
        const stats = item.statistics?.[0];

        if (!player || !stats) continue;

        const age = player.age;
        const shirtNumber = stats.games?.number ?? null;
        const position = stats.games?.position || player.position || null;
        const club = stats.team?.name || team.name;
        const leagueName = stats.league?.name || team.league;

        const result = await pool.query(
          `INSERT INTO players
             (api_id, name, age, shirt_number, position, league, nationality, club, photo_url, season, imported_at)
           VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,NOW())
           ON CONFLICT (api_id) DO UPDATE SET
             name        = EXCLUDED.name,
             age         = EXCLUDED.age,
             shirt_number= EXCLUDED.shirt_number,
             position    = EXCLUDED.position,
             league      = EXCLUDED.league,
             nationality = EXCLUDED.nationality,
             club        = EXCLUDED.club,
             photo_url   = EXCLUDED.photo_url,
             season      = EXCLUDED.season,
             imported_at = NOW()
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
            player.photo,
            season,
          ]
        );

        if (result.rows[0]?.inserted) totalAdded++;
        else totalUpdated++;
      }

      console.log(`✅ ${team.name} importé`);

      // Pause de 300 ms pour respecter les limites de débit
      await new Promise(r => setTimeout(r, 300));
    } catch (err) {
      console.error(`❌ Erreur import ${team.name}:`, err.message);
      errors.push(`${team.name}: ${err.message}`);
    }
  }

  res.json({
    message: 'Import terminé',
    added: totalAdded,
    updated: totalUpdated,
    errors: errors.length > 0 ? errors : undefined,
    api_requests_used: TOP_TEAMS.length,
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
