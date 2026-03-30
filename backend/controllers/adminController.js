const pool = require('../config/db');

// GET /api/admin/users
const getAllUsers = async (req, res) => {
  try {
    const { page = 1, limit = 20, search = '' } = req.query;
    const offset = (parseInt(page) - 1) * parseInt(limit);

    let query = `
      SELECT id, username, email, role, total_points, daily_wins, random_wins, created_at
      FROM users
    `;
    const params = [];

    if (search) {
      query += ` WHERE username ILIKE $1 OR email ILIKE $1`;
      params.push(`%${search}%`);
    }

    query += ` ORDER BY total_points DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
    params.push(parseInt(limit), offset);

    const countQuery = search
      ? `SELECT COUNT(*) FROM users WHERE username ILIKE $1 OR email ILIKE $1`
      : `SELECT COUNT(*) FROM users`;

    const [usersResult, countResult] = await Promise.all([
      pool.query(query, params),
      pool.query(countQuery, search ? [`%${search}%`] : []),
    ]);

    res.json({
      users: usersResult.rows,
      total: parseInt(countResult.rows[0].count),
    });
  } catch (err) {
    console.error('Erreur getAllUsers:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// DELETE /api/admin/users/:id
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    if (parseInt(id) === req.user.id) {
      return res.status(400).json({ error: 'Impossible de supprimer votre propre compte' });
    }

    const userResult = await pool.query(
      'SELECT id, username, role FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    if (userResult.rows[0].role === 'admin') {
      return res.status(403).json({ error: 'Impossible de supprimer un autre administrateur' });
    }

    await pool.query('DELETE FROM users WHERE id = $1', [id]);

    res.json({ message: `Utilisateur ${userResult.rows[0].username} supprimé avec succès` });
  } catch (err) {
    console.error('Erreur deleteUser:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/users/:id/history
const getUserHistory = async (req, res) => {
  try {
    const { id } = req.params;

    const userResult = await pool.query(
      'SELECT id, username, email, total_points, daily_wins, random_wins FROM users WHERE id = $1',
      [id]
    );

    if (userResult.rows.length === 0) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    const sessionsResult = await pool.query(
      `SELECT gs.id, gs.game_type, gs.attempts, gs.won, gs.points_earned,
              gs.game_date, gs.completed_at, gs.created_at,
              p.name as player_name, p.club as player_club, p.photo_url as player_photo
       FROM game_sessions gs
       LEFT JOIN players p ON p.id = gs.player_id
       WHERE gs.user_id = $1
         AND gs.completed_at IS NOT NULL
       ORDER BY gs.created_at DESC
       LIMIT 50`,
      [id]
    );

    res.json({
      user: userResult.rows[0],
      history: sessionsResult.rows,
    });
  } catch (err) {
    console.error('Erreur getUserHistory:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /api/admin/users/:id/role
const updateUserRole = async (req, res) => {
  try {
    const { id } = req.params;
    const { role } = req.body;

    if (!['user', 'admin'].includes(role)) {
      return res.status(400).json({ error: 'Rôle invalide' });
    }

    await pool.query(
      'UPDATE users SET role = $1, updated_at = NOW() WHERE id = $2',
      [role, id]
    );

    res.json({ message: 'Rôle mis à jour' });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/stats
const getStats = async (req, res) => {
  try {
    const [usersCount, sessionsCount, todaySessions, playersCount] = await Promise.all([
      pool.query('SELECT COUNT(*) FROM users WHERE role = $1', ['user']),
      pool.query('SELECT COUNT(*), SUM(CASE WHEN won THEN 1 ELSE 0 END) as wins FROM game_sessions'),
      pool.query(`SELECT COUNT(*) FROM game_sessions WHERE game_date = CURRENT_DATE`),
      pool.query('SELECT COUNT(*) FROM players'),
    ]);

    res.json({
      total_users: parseInt(usersCount.rows[0].count),
      total_sessions: parseInt(sessionsCount.rows[0].count),
      total_wins: parseInt(sessionsCount.rows[0].wins),
      today_sessions: parseInt(todaySessions.rows[0].count),
      total_players: parseInt(playersCount.rows[0].count),
    });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/admin/imported-today — Joueurs importés/mis à jour aujourd'hui
const getImportedToday = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, api_id, name, age, shirt_number, position, league, nationality, club, photo_url, imported_at
       FROM players
       WHERE DATE(imported_at) = CURRENT_DATE
       ORDER BY imported_at DESC`
    );

    res.json({
      players: result.rows,
      total: result.rows.length,
      date: new Date().toISOString().split('T')[0],
    });
  } catch (err) {
    console.error('Erreur getImportedToday:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getAllUsers, deleteUser, getUserHistory, updateUserRole, getStats, getImportedToday };
