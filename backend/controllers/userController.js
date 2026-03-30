const bcrypt = require('bcryptjs');
const pool = require('../config/db');

// GET /api/users/profile
const getProfile = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT id, username, email, role, total_points, daily_wins, random_wins, created_at
       FROM users WHERE id = $1`,
      [req.user.id]
    );
    res.json({ user: result.rows[0] });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// PUT /api/users/profile
const updateProfile = async (req, res) => {
  try {
    const { username, email, currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    const userResult = await pool.query('SELECT * FROM users WHERE id = $1', [userId]);
    const user = userResult.rows[0];

    const updates = {};
    const params = [];
    let paramIndex = 1;

    if (username && username !== user.username) {
      if (username.length < 3 || username.length > 50) {
        return res.status(400).json({ error: 'Le pseudo doit contenir entre 3 et 50 caractères' });
      }
      const existing = await pool.query('SELECT id FROM users WHERE username = $1 AND id != $2', [username, userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Ce pseudo est déjà pris' });
      }
      updates.username = username;
    }

    if (email && email !== user.email) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({ error: 'Email invalide' });
      }
      const existing = await pool.query('SELECT id FROM users WHERE email = $1 AND id != $2', [email, userId]);
      if (existing.rows.length > 0) {
        return res.status(409).json({ error: 'Cet email est déjà utilisé' });
      }
      updates.email = email.toLowerCase();
    }

    if (newPassword) {
      if (!currentPassword) {
        return res.status(400).json({ error: 'Mot de passe actuel requis' });
      }
      const isValid = await bcrypt.compare(currentPassword, user.password_hash);
      if (!isValid) {
        return res.status(401).json({ error: 'Mot de passe actuel incorrect' });
      }
      if (newPassword.length < 6) {
        return res.status(400).json({ error: 'Le nouveau mot de passe doit contenir au moins 6 caractères' });
      }
      updates.password_hash = await bcrypt.hash(newPassword, 12);
    }

    if (Object.keys(updates).length === 0) {
      return res.status(400).json({ error: 'Aucune modification détectée' });
    }

    const setClauses = Object.keys(updates).map(key => {
      params.push(updates[key]);
      return `${key} = $${paramIndex++}`;
    });

    params.push(userId);
    await pool.query(
      `UPDATE users SET ${setClauses.join(', ')}, updated_at = NOW() WHERE id = $${paramIndex}`,
      params
    );

    const updated = await pool.query(
      'SELECT id, username, email, role, total_points, daily_wins, random_wins FROM users WHERE id = $1',
      [userId]
    );

    res.json({ message: 'Profil mis à jour !', user: updated.rows[0] });
  } catch (err) {
    console.error('Erreur updateProfile:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/users/history
const getMyHistory = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT gs.id, gs.game_type, gs.attempts, gs.won, gs.points_earned,
              gs.game_date, gs.completed_at, gs.created_at,
              p.name as player_name, p.club as player_club, p.photo_url as player_photo
       FROM game_sessions gs
       LEFT JOIN players p ON p.id = gs.player_id
       WHERE gs.user_id = $1
         AND gs.completed_at IS NOT NULL
       ORDER BY gs.created_at DESC
       LIMIT 30`,
      [req.user.id]
    );

    res.json({ history: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getProfile, updateProfile, getMyHistory };
