const pool = require('../config/db');

// GET /api/leaderboard?limit=50
const getLeaderboard = async (req, res) => {
  try {
    const limit = Math.min(parseInt(req.query.limit) || 50, 100);

    const result = await pool.query(
      `SELECT id, username, total_points, daily_wins, random_wins,
              RANK() OVER (ORDER BY total_points DESC) as rank
       FROM users
       WHERE role = 'user'
       ORDER BY total_points DESC
       LIMIT $1`,
      [limit]
    );

    // Rang de l'utilisateur connecté
    let userRank = null;
    if (req.user) {
      const rankResult = await pool.query(
        `SELECT rank FROM (
           SELECT id, RANK() OVER (ORDER BY total_points DESC) as rank
           FROM users WHERE role = 'user'
         ) ranked WHERE id = $1`,
        [req.user.id]
      );
      userRank = rankResult.rows[0]?.rank || null;
    }

    res.json({
      leaderboard: result.rows,
      user_rank: userRank,
    });
  } catch (err) {
    console.error('Erreur getLeaderboard:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getLeaderboard };
