require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const migrate = async () => {
  const client = await pool.connect();
  try {
    console.log('🚀 Démarrage de la migration...');

    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        role VARCHAR(20) DEFAULT 'user' CHECK (role IN ('user', 'admin')),
        total_points INTEGER DEFAULT 0,
        daily_wins INTEGER DEFAULT 0,
        random_wins INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT NOW(),
        updated_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table users créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS players (
        id SERIAL PRIMARY KEY,
        api_id INTEGER UNIQUE,
        name VARCHAR(255) NOT NULL,
        age INTEGER,
        shirt_number INTEGER,
        position VARCHAR(100),
        league VARCHAR(255),
        nationality VARCHAR(100),
        club VARCHAR(255),
        photo_url TEXT,
        season INTEGER DEFAULT 2024,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table players créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS daily_players (
        id SERIAL PRIMARY KEY,
        player_id INTEGER REFERENCES players(id) ON DELETE CASCADE,
        game_date DATE UNIQUE NOT NULL DEFAULT CURRENT_DATE,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table daily_players créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_sessions (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE,
        player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
        game_type VARCHAR(20) NOT NULL CHECK (game_type IN ('daily', 'random')),
        attempts INTEGER DEFAULT 0,
        won BOOLEAN DEFAULT FALSE,
        points_earned INTEGER DEFAULT 0,
        game_date DATE DEFAULT CURRENT_DATE,
        completed_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table game_sessions créée');

    await client.query(`
      CREATE TABLE IF NOT EXISTS game_attempts (
        id SERIAL PRIMARY KEY,
        session_id INTEGER REFERENCES game_sessions(id) ON DELETE CASCADE,
        attempt_number INTEGER NOT NULL,
        guessed_player_id INTEGER REFERENCES players(id) ON DELETE SET NULL,
        guessed_player_name VARCHAR(255),
        result_age BOOLEAN,
        result_shirt_number BOOLEAN,
        result_position BOOLEAN,
        result_league BOOLEAN,
        result_nationality BOOLEAN,
        result_club BOOLEAN,
        age_direction VARCHAR(10),
        shirt_direction VARCHAR(10),
        created_at TIMESTAMP DEFAULT NOW()
      );
    `);
    console.log('✅ Table game_attempts créée');

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_daily_players_date ON daily_players(game_date);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_user ON game_sessions(user_id);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_date ON game_sessions(game_date);
      CREATE INDEX IF NOT EXISTS idx_game_sessions_type ON game_sessions(game_type);
      CREATE INDEX IF NOT EXISTS idx_users_points ON users(total_points DESC);
    `);
    console.log('✅ Index créés');

    // Insert admin user by default
    const bcrypt = require('bcryptjs');
    const adminPassword = await bcrypt.hash('Admin1234!', 12);
    await client.query(`
      INSERT INTO users (username, email, password_hash, role)
      VALUES ('admin', 'admin@footballdle.com', $1, 'admin')
      ON CONFLICT (email) DO NOTHING;
    `, [adminPassword]);
    console.log('✅ Administrateur créé (admin@footballdle.com / Admin1234!)');

    console.log('\n🎉 Migration terminée avec succès !');
  } catch (err) {
    console.error('❌ Erreur lors de la migration:', err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
};

migrate();
