const pool = require('../config/db');

const pickDailyPlayer = async () => {
  const today = new Date().toISOString().split('T')[0];

  // Vérifier si un joueur est déjà sélectionné aujourd'hui
  const existing = await pool.query(
    'SELECT id FROM daily_players WHERE game_date = $1',
    [today]
  );

  if (existing.rows.length > 0) {
    return; // Déjà sélectionné
  }

  // Prendre les IDs déjà utilisés les 30 derniers jours pour éviter les répétitions
  const recentResult = await pool.query(
    `SELECT player_id FROM daily_players
     WHERE game_date > CURRENT_DATE - INTERVAL '30 days'`
  );
  const recentIds = recentResult.rows.map(r => r.player_id);

  let query = 'SELECT id FROM players';
  const params = [];

  if (recentIds.length > 0) {
    query += ' WHERE id != ALL($1)';
    params.push(recentIds);
  }

  query += ' ORDER BY RANDOM() LIMIT 1';

  const playerResult = await pool.query(query, params);

  if (playerResult.rows.length === 0) {
    // Si tous les joueurs ont été utilisés récemment, on prend n'importe lequel
    const fallback = await pool.query('SELECT id FROM players ORDER BY RANDOM() LIMIT 1');
    if (fallback.rows.length === 0) return;
    await pool.query(
      'INSERT INTO daily_players (player_id, game_date) VALUES ($1, $2) ON CONFLICT (game_date) DO NOTHING',
      [fallback.rows[0].id, today]
    );
    return;
  }

  await pool.query(
    'INSERT INTO daily_players (player_id, game_date) VALUES ($1, $2) ON CONFLICT (game_date) DO NOTHING',
    [playerResult.rows[0].id, today]
  );
};

module.exports = { pickDailyPlayer };
