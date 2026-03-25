const axios = require('axios');
const pool = require('../config/db');

const RAPIDAPI_KEY = process.env.RAPIDAPI_KEY;
const RAPIDAPI_HOST = 'api-football-v1.p.rapidapi.com';

// Leagues à inclure (IDs API-Football)
const LEAGUES = [
  { id: 39, name: 'Premier League', country: 'England' },
  { id: 140, name: 'La Liga', country: 'Spain' },
  { id: 135, name: 'Serie A', country: 'Italy' },
  { id: 78, name: 'Bundesliga', country: 'Germany' },
  { id: 61, name: 'Ligue 1', country: 'France' },
];

const apiRequest = async (endpoint, params) => {
  const response = await axios.get(`https://${RAPIDAPI_HOST}/v3/${endpoint}`, {
    headers: {
      'x-rapidapi-key': RAPIDAPI_KEY,
      'x-rapidapi-host': RAPIDAPI_HOST,
    },
    params,
  });
  return response.data;
};

// POST /api/players/sync - Synchronise les joueurs depuis l'API
const syncPlayers = async (req, res) => {
  try {
    const season = req.body.season || 2024;
    let totalAdded = 0;
    let totalUpdated = 0;

    for (const league of LEAGUES) {
      try {
        console.log(`📡 Sync ${league.name}...`);
        let page = 1;
        let hasMore = true;

        while (hasMore) {
          const data = await apiRequest('players', {
            league: league.id,
            season,
            page,
          });

          if (!data.response || data.response.length === 0) {
            hasMore = false;
            break;
          }

          for (const item of data.response) {
            const player = item.player;
            const stats = item.statistics?.[0];

            if (!player || !stats) continue;

            const age = player.age;
            const shirtNumber = stats.games?.number || null;
            const position = stats.games?.position || player.position;
            const club = stats.team?.name || null;

            const result = await pool.query(
              `INSERT INTO players (api_id, name, age, shirt_number, position, league, nationality, club, photo_url, season)
               VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10)
               ON CONFLICT (api_id) DO UPDATE SET
                 name = EXCLUDED.name,
                 age = EXCLUDED.age,
                 shirt_number = EXCLUDED.shirt_number,
                 position = EXCLUDED.position,
                 league = EXCLUDED.league,
                 nationality = EXCLUDED.nationality,
                 club = EXCLUDED.club,
                 photo_url = EXCLUDED.photo_url,
                 season = EXCLUDED.season
               RETURNING (xmax = 0) AS inserted`,
              [
                player.id, player.name, age, shirtNumber,
                position, league.name, player.nationality,
                club, player.photo, season,
              ]
            );

            if (result.rows[0].inserted) totalAdded++;
            else totalUpdated++;
          }

          // Pagination
          const totalPages = data.paging?.total || 1;
          if (page >= totalPages) hasMore = false;
          else page++;

          // Pause pour respecter les limites de l'API
          await new Promise(r => setTimeout(r, 500));
        }

        console.log(`✅ ${league.name} synchronisé`);
      } catch (leagueErr) {
        console.error(`❌ Erreur sync ${league.name}:`, leagueErr.message);
      }
    }

    res.json({
      message: 'Synchronisation terminée',
      added: totalAdded,
      updated: totalUpdated,
    });
  } catch (err) {
    console.error('Erreur syncPlayers:', err);
    res.status(500).json({ error: 'Erreur lors de la synchronisation' });
  }
};

// GET /api/players - Liste paginée
const getPlayers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `SELECT id, name, age, shirt_number, position, league, nationality, club, photo_url
                 FROM players`;
    let countQuery = `SELECT COUNT(*) FROM players`;
    const params = [];

    if (search) {
      query += ` WHERE name ILIKE $1`;
      countQuery += ` WHERE name ILIKE $1`;
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

// GET /api/players/daily - Joueur du jour (sans révéler qui c'est)
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

    // On ne révèle que la photo silhouette côté client
    res.json({ has_daily_player: true });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { syncPlayers, getPlayers, getDailyPlayerInfo };
