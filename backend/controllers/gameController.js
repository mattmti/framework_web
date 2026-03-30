const pool = require('../config/db');

const DAILY_POINTS = 100;
const RANDOM_POINTS = 5;
const MAX_ATTEMPTS = 10;

// Compare deux valeurs numériques et retourne direction
const compareNumeric = (guessed, target) => {
  if (guessed === target) return { match: true, direction: null };
  return { match: false, direction: guessed < target ? 'up' : 'down' };
};

// Compare le joueur deviné avec la cible
const comparePlayer = (guessed, target) => {
  const ageResult = compareNumeric(guessed.age, target.age);
  const shirtResult = compareNumeric(guessed.shirt_number, target.shirt_number);

  return {
    age: ageResult.match,
    age_direction: ageResult.direction,
    shirt_number: shirtResult.match,
    shirt_direction: shirtResult.direction,
    position: guessed.position?.toLowerCase() === target.position?.toLowerCase(),
    league: guessed.league?.toLowerCase() === target.league?.toLowerCase(),
    nationality: guessed.nationality?.toLowerCase() === target.nationality?.toLowerCase(),
    club: guessed.club?.toLowerCase() === target.club?.toLowerCase(),
  };
};

// GET /api/game/daily/status
const getDailyStatus = async (req, res) => {
  try {
    const today = new Date().toISOString().split('T')[0];

    const dailyResult = await pool.query(
      `SELECT dp.id, p.name, p.photo_url
       FROM daily_players dp
       JOIN players p ON p.id = dp.player_id
       WHERE dp.game_date = $1`,
      [today]
    );

    if (dailyResult.rows.length === 0) {
      return res.status(404).json({ error: "Aucun joueur quotidien défini pour aujourd'hui" });
    }

    let userSession = null;

    if (req.user) {
      const sessionResult = await pool.query(
        `SELECT gs.id, gs.attempts, gs.won, gs.points_earned, gs.completed_at
         FROM game_sessions gs
         JOIN daily_players dp ON dp.player_id = gs.player_id
         WHERE gs.user_id = $1 AND gs.game_type = 'daily' AND gs.game_date = $2`,
        [req.user.id, today]
      );

      if (sessionResult.rows.length > 0) {
        const session = sessionResult.rows[0];
        const attemptsResult = await pool.query(
          `SELECT ga.*, p.name, p.age, p.shirt_number, p.position, p.league, p.nationality, p.club, p.photo_url
           FROM game_attempts ga
           JOIN players p ON p.id = ga.guessed_player_id
           WHERE ga.session_id = $1
           ORDER BY ga.attempt_number DESC`,
          [session.id]
        );
        userSession = { ...session, attempts_list: attemptsResult.rows };
      }
    }

    res.json({
      available: !userSession || (!userSession.won && userSession.attempts < MAX_ATTEMPTS),
      already_won: userSession?.won || false,
      attempts_used: userSession?.attempts || 0,
      session: userSession,
    });
  } catch (err) {
    console.error('Erreur getDailyStatus:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/game/daily/start
const startDailyGame = async (req, res) => {
  try {
    if (!req.user) {
      return res.status(401).json({ error: 'Connexion requise pour jouer au mode quotidien' });
    }

    const today = new Date().toISOString().split('T')[0];

    const dailyResult = await pool.query(
      `SELECT dp.player_id FROM daily_players dp WHERE dp.game_date = $1`,
      [today]
    );

    if (dailyResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aucun joueur quotidien disponible' });
    }

    const playerId = dailyResult.rows[0].player_id;

    // Vérifier session existante
    const existingSession = await pool.query(
      `SELECT id, attempts, won FROM game_sessions
       WHERE user_id = $1 AND game_type = 'daily' AND game_date = $2`,
      [req.user.id, today]
    );

    if (existingSession.rows.length > 0) {
      const s = existingSession.rows[0];
      // Bloquer si déjà gagné ou plus de tentatives
      if (s.won || s.attempts >= MAX_ATTEMPTS) {
        return res.status(409).json({
          error: s.won
            ? "Déjà gagné aujourd'hui !"
            : "Plus de tentatives disponibles pour aujourd'hui",
          session_id: s.id,
        });
      }
      return res.json({ session_id: s.id, attempts_used: s.attempts });
    }

    const sessionResult = await pool.query(
      `INSERT INTO game_sessions (user_id, player_id, game_type, game_date)
       VALUES ($1, $2, 'daily', $3)
       RETURNING id`,
      [req.user.id, playerId, today]
    );

    res.json({ session_id: sessionResult.rows[0].id, attempts_used: 0 });
  } catch (err) {
    console.error('Erreur startDailyGame:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/game/random/start
const startRandomGame = async (req, res) => {
  try {
    const playerResult = await pool.query(
      `SELECT id FROM players ORDER BY RANDOM() LIMIT 1`
    );

    if (playerResult.rows.length === 0) {
      return res.status(404).json({ error: 'Aucun joueur disponible dans la base' });
    }

    const playerId = playerResult.rows[0].id;
    let sessionId;

    if (req.user) {
      const sessionResult = await pool.query(
        `INSERT INTO game_sessions (user_id, player_id, game_type)
         VALUES ($1, $2, 'random')
         RETURNING id`,
        [req.user.id, playerId]
      );
      sessionId = sessionResult.rows[0].id;
    }

    res.json({
      session_id: sessionId || null,
      player_id: playerId,
      attempts_used: 0,
    });
  } catch (err) {
    console.error('Erreur startRandomGame:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// POST /api/game/guess
const makeGuess = async (req, res) => {
  try {
    const { session_id, player_id, guessed_player_id } = req.body;

    if (!guessed_player_id) {
      return res.status(400).json({ error: 'Joueur deviné requis' });
    }

    const guessedPlayerId = parseInt(guessed_player_id);
    const sessionIdNum = session_id ? parseInt(session_id) : null;
    const playerIdNum = player_id ? parseInt(player_id) : null;

    let targetPlayerId;
    let currentAttempts = 0;
    let gameType = 'random';

    if (sessionIdNum && req.user) {
      // Session authentifiée
      const sessionResult = await pool.query(
        `SELECT gs.*, gs.player_id as target_player_id
         FROM game_sessions gs
         WHERE gs.id = $1 AND gs.user_id = $2`,
        [sessionIdNum, req.user.id]
      );

      if (sessionResult.rows.length === 0) {
        return res.status(404).json({ error: 'Session non trouvée' });
      }

      const session = sessionResult.rows[0];

      // Vérifier que la partie n'est pas déjà terminée
      if (session.won || session.attempts >= MAX_ATTEMPTS) {
        return res.status(409).json({ error: 'Partie déjà terminée' });
      }

      targetPlayerId = parseInt(session.target_player_id);
      currentAttempts = session.attempts;
      gameType = session.game_type;
    } else if (playerIdNum) {
      // Mode anonyme (random uniquement)
      targetPlayerId = playerIdNum;
      gameType = 'random';
    } else {
      return res.status(400).json({ error: 'Session ou player_id requis' });
    }

    // Récupérer les joueurs
    const [targetRes, guessedRes] = await Promise.all([
      pool.query('SELECT * FROM players WHERE id = $1', [targetPlayerId]),
      pool.query('SELECT * FROM players WHERE id = $1', [guessedPlayerId]),
    ]);

    if (targetRes.rows.length === 0 || guessedRes.rows.length === 0) {
      return res.status(404).json({ error: 'Joueur non trouvé' });
    }

    const target = targetRes.rows[0];
    const guessed = guessedRes.rows[0];
    const comparison = comparePlayer(guessed, target);
    const newAttempts = currentAttempts + 1;
    const isWon = guessed.id === target.id;
    const isGameOver = isWon || newAttempts >= MAX_ATTEMPTS;

    // Sauvegarder en BDD si session authentifiée
    if (sessionIdNum && req.user) {
      const pointsEarned = isWon
        ? (gameType === 'daily' ? DAILY_POINTS : RANDOM_POINTS)
        : 0;

      // Enregistrer la tentative (1 seul INSERT)
      await pool.query(
        `INSERT INTO game_attempts (
          session_id, attempt_number, guessed_player_id, guessed_player_name,
          result_age, result_shirt_number, result_position, result_league,
          result_nationality, result_club, age_direction, shirt_direction
        ) VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
        [
          sessionIdNum,
          newAttempts,
          guessedPlayerId,
          guessed.name,
          comparison.age === true,
          comparison.shirt_number === true,
          comparison.position === true,
          comparison.league === true,
          comparison.nationality === true,
          comparison.club === true,
          comparison.age_direction || null,
          comparison.shirt_direction || null,
        ]
      );

      // ✅ CORRECTIF : Mettre à jour game_sessions (attempts + won + points)
      await pool.query(
        `UPDATE game_sessions
         SET attempts       = $1,
             won            = $2,
             points_earned  = $3,
             completed_at   = CASE WHEN $4 THEN NOW() ELSE completed_at END
         WHERE id = $5`,
        [newAttempts, isWon, pointsEarned, isGameOver, sessionIdNum]
      );

      // Mettre à jour les stats utilisateur si victoire
      if (isWon) {
        const wonColumn = gameType === 'daily' ? 'daily_wins' : 'random_wins';
        await pool.query(
          `UPDATE users
           SET total_points = total_points + $1,
               ${wonColumn} = ${wonColumn} + 1,
               updated_at   = NOW()
           WHERE id = $2`,
          [pointsEarned, req.user.id]
        );
      }
    }

    const response = {
      comparison,
      is_won: isWon,
      is_game_over: isGameOver,
      attempts_used: newAttempts,
      attempts_remaining: MAX_ATTEMPTS - newAttempts,
      guessed_player: {
        id: guessed.id,
        name: guessed.name,
        age: guessed.age,
        shirt_number: guessed.shirt_number,
        position: guessed.position,
        league: guessed.league,
        nationality: guessed.nationality,
        club: guessed.club,
        photo_url: guessed.photo_url,
      },
    };

    if (isGameOver) {
      response.target_player = {
        id: target.id,
        name: target.name,
        age: target.age,
        shirt_number: target.shirt_number,
        position: target.position,
        league: target.league,
        nationality: target.nationality,
        club: target.club,
        photo_url: target.photo_url,
      };
      if (isWon) {
        response.points_earned = gameType === 'daily' ? DAILY_POINTS : RANDOM_POINTS;
      }
    }

    res.json(response);
  } catch (err) {
    console.error('Erreur makeGuess:', err);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

// GET /api/game/players/search?q=mbappe  (supporte accents : Muller → Müller)
const searchPlayers = async (req, res) => {
  try {
    const { q } = req.query;
    if (!q || q.length < 2) {
      return res.json({ players: [] });
    }

    const result = await pool.query(
      `SELECT id, name, club, nationality, photo_url
       FROM players
       WHERE unaccent(name) ILIKE unaccent($1)
       ORDER BY name
       LIMIT 10`,
      [`%${q}%`]
    );

    res.json({ players: result.rows });
  } catch (err) {
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

module.exports = { getDailyStatus, startDailyGame, startRandomGame, makeGuess, searchPlayers };
