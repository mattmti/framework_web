const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const pool = require('../config/db');

const generateToken = (userId) => {
  return jwt.sign(
    { userId },
    process.env.JWT_SECRET,
    { expiresIn: '7d' }
  );
};

// POST /api/auth/register
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;

    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Tous les champs sont obligatoires' });
    }

    if (username.length < 3 || username.length > 50) {
      return res.status(400).json({ error: 'Le pseudo doit contenir entre 3 et 50 caractères' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Email invalide' });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    }

    // Check unicité
    const existing = await pool.query(
      'SELECT id FROM users WHERE email = $1 OR username = $2',
      [email.toLowerCase(), username]
    );
    if (existing.rows.length > 0) {
      return res.status(409).json({ error: 'Email ou pseudo déjà utilisé' });
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const result = await pool.query(
      `INSERT INTO users (username, email, password_hash)
       VALUES ($1, $2, $3)
       RETURNING id, username, email, role, total_points, created_at`,
      [username, email.toLowerCase(), passwordHash]
    );

    const user = result.rows[0];
    const token = generateToken(user.id);

    res.status(201).json({
      message: 'Compte créé avec succès !',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        total_points: user.total_points,
      },
    });
  } catch (err) {
    console.error('Erreur register:', err);
    res.status(500).json({ error: 'Erreur lors de la création du compte' });
  }
};

// POST /api/auth/login
const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const result = await pool.query(
      'SELECT * FROM users WHERE email = $1',
      [email.toLowerCase()]
    );

    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const user = result.rows[0];
    const isValid = await bcrypt.compare(password, user.password_hash);

    if (!isValid) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    const token = generateToken(user.id);

    res.json({
      message: 'Connexion réussie !',
      token,
      user: {
        id: user.id,
        username: user.username,
        email: user.email,
        role: user.role,
        total_points: user.total_points,
        daily_wins: user.daily_wins,
        random_wins: user.random_wins,
      },
    });
  } catch (err) {
    console.error('Erreur login:', err);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

// GET /api/auth/me
const getMe = async (req, res) => {
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

module.exports = { register, login, getMe };
