require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// ─────────────────────────────────────────────────────────────────────────────
// SEED MANUEL — Saison 2025/2026
// 20 clubs × 3-4 joueurs = ~70 joueurs
// api_id = identifiant API-Sports v3 (api-sports.io / football-api.com)
// photo  = https://media.api-sports.io/football/players/{api_id}.png
// ─────────────────────────────────────────────────────────────────────────────

const players = [

  // ══════════════════════════════════════════════════════════════════════════
  // 🏴󠁧󠁢󠁥󠁮󠁧󠁿  PREMIER LEAGUE — Angleterre
  // ══════════════════════════════════════════════════════════════════════════

  // ── Manchester City ───────────────────────────────────────────────────────
  { api_id: 1100,   name: 'Erling Haaland',      age: 25, shirt_number: 9,  position: 'Attacker',   league: 'Premier League', nationality: 'Norway',      club: 'Manchester City' },
  { api_id: 200120, name: 'Phil Foden',           age: 25, shirt_number: 47, position: 'Midfielder', league: 'Premier League', nationality: 'England',     club: 'Manchester City' },
  { api_id: 47232,  name: 'Bernardo Silva',       age: 31, shirt_number: 20, position: 'Midfielder', league: 'Premier League', nationality: 'Portugal',    club: 'Manchester City' },
  { api_id: 614,    name: 'Ederson',              age: 32, shirt_number: 31, position: 'Goalkeeper', league: 'Premier League', nationality: 'Brazil',      club: 'Manchester City' },

  // ── Liverpool ─────────────────────────────────────────────────────────────
  { api_id: 306,    name: 'Mohamed Salah',        age: 33, shirt_number: 11, position: 'Attacker',   league: 'Premier League', nationality: 'Egypt',       club: 'Liverpool' },
  { api_id: 1320,   name: 'Virgil van Dijk',      age: 34, shirt_number: 4,  position: 'Defender',   league: 'Premier League', nationality: 'Netherlands', club: 'Liverpool' },
  { api_id: 284830, name: 'Alexis Mac Allister',  age: 27, shirt_number: 10, position: 'Midfielder', league: 'Premier League', nationality: 'Argentina',   club: 'Liverpool' },
  { api_id: 345801, name: 'Cody Gakpo',           age: 26, shirt_number: 18, position: 'Attacker',   league: 'Premier League', nationality: 'Netherlands', club: 'Liverpool' },

  // ── Arsenal ───────────────────────────────────────────────────────────────
  { api_id: 18846,  name: 'Bukayo Saka',          age: 24, shirt_number: 7,  position: 'Midfielder', league: 'Premier League', nationality: 'England',     club: 'Arsenal' },
  { api_id: 111362, name: 'Martin Ødegaard',      age: 27, shirt_number: 8,  position: 'Midfielder', league: 'Premier League', nationality: 'Norway',      club: 'Arsenal' },
  { api_id: 212722, name: 'Declan Rice',          age: 27, shirt_number: 41, position: 'Midfielder', league: 'Premier League', nationality: 'England',     club: 'Arsenal' },
  { api_id: 303847, name: 'Gabriel Martinelli',   age: 24, shirt_number: 11, position: 'Attacker',   league: 'Premier League', nationality: 'Brazil',      club: 'Arsenal' },

  // ── Chelsea ───────────────────────────────────────────────────────────────
  { api_id: 418460, name: 'Cole Palmer',          age: 23, shirt_number: 20, position: 'Midfielder', league: 'Premier League', nationality: 'England',     club: 'Chelsea' },
  { api_id: 395599, name: 'Enzo Fernández',       age: 25, shirt_number: 8,  position: 'Midfielder', league: 'Premier League', nationality: 'Argentina',   club: 'Chelsea' },
  { api_id: 289509, name: 'Reece James',          age: 26, shirt_number: 24, position: 'Defender',   league: 'Premier League', nationality: 'England',     club: 'Chelsea' },
  { api_id: 321322, name: 'Nicolas Jackson',      age: 24, shirt_number: 15, position: 'Attacker',   league: 'Premier League', nationality: 'Senegal',     club: 'Chelsea' },

  // ══════════════════════════════════════════════════════════════════════════
  // 🇪🇸  LA LIGA — Espagne
  // ══════════════════════════════════════════════════════════════════════════

  // ── Real Madrid ───────────────────────────────────────────────────────────
  { api_id: 278,    name: 'Kylian Mbappé',        age: 27, shirt_number: 9,  position: 'Attacker',   league: 'La Liga',        nationality: 'France',      club: 'Real Madrid' },
  { api_id: 24792,  name: 'Vinicius Junior',       age: 25, shirt_number: 7,  position: 'Attacker',   league: 'La Liga',        nationality: 'Brazil',      club: 'Real Madrid' },
  { api_id: 167948, name: 'Jude Bellingham',       age: 22, shirt_number: 5,  position: 'Midfielder', league: 'La Liga',        nationality: 'England',     club: 'Real Madrid' },
  { api_id: 8998,   name: 'Thibaut Courtois',      age: 33, shirt_number: 1,  position: 'Goalkeeper', league: 'La Liga',        nationality: 'Belgium',     club: 'Real Madrid' },
  { api_id: 365557, name: 'Federico Valverde',     age: 27, shirt_number: 15, position: 'Midfielder', league: 'La Liga',        nationality: 'Uruguay',     club: 'Real Madrid' },

  // ── Barcelona ─────────────────────────────────────────────────────────────
  { api_id: 415229, name: 'Lamine Yamal',          age: 18, shirt_number: 19, position: 'Attacker',   league: 'La Liga',        nationality: 'Spain',       club: 'Barcelona' },
  { api_id: 48750,  name: 'Pedri',                 age: 23, shirt_number: 8,  position: 'Midfielder', league: 'La Liga',        nationality: 'Spain',       club: 'Barcelona' },
  { api_id: 521,    name: 'Robert Lewandowski',    age: 37, shirt_number: 9,  position: 'Attacker',   league: 'La Liga',        nationality: 'Poland',      club: 'Barcelona' },
  { api_id: 342888, name: 'Gavi',                  age: 21, shirt_number: 6,  position: 'Midfielder', league: 'La Liga',        nationality: 'Spain',       club: 'Barcelona' },
  { api_id: 349011, name: 'Raphinha',              age: 29, shirt_number: 11, position: 'Attacker',   league: 'La Liga',        nationality: 'Brazil',      club: 'Barcelona' },

  // ── Atlético Madrid ───────────────────────────────────────────────────────
  { api_id: 1029,   name: 'Antoine Griezmann',     age: 34, shirt_number: 7,  position: 'Attacker',   league: 'La Liga',        nationality: 'France',      club: 'Atlético Madrid' },
  { api_id: 415046, name: 'Julián Álvarez',        age: 25, shirt_number: 19, position: 'Attacker',   league: 'La Liga',        nationality: 'Argentina',   club: 'Atlético Madrid' },
  { api_id: 49467,  name: 'Rodrigo De Paul',       age: 31, shirt_number: 5,  position: 'Midfielder', league: 'La Liga',        nationality: 'Argentina',   club: 'Atlético Madrid' },
  { api_id: 1478,   name: 'Jan Oblak',             age: 32, shirt_number: 13, position: 'Goalkeeper', league: 'La Liga',        nationality: 'Slovenia',    club: 'Atlético Madrid' },

  // ── Villarreal ────────────────────────────────────────────────────────────
  { api_id: 344977, name: 'Yeremy Pino',           age: 23, shirt_number: 11, position: 'Attacker',   league: 'La Liga',        nationality: 'Spain',       club: 'Villarreal' },
  { api_id: 373997, name: 'Alex Baena',            age: 24, shirt_number: 10, position: 'Midfielder', league: 'La Liga',        nationality: 'Spain',       club: 'Villarreal' },
  { api_id: 2931,   name: 'Pepe Reina',            age: 43, shirt_number: 25, position: 'Goalkeeper', league: 'La Liga',        nationality: 'Spain',       club: 'Villarreal' },

  // ══════════════════════════════════════════════════════════════════════════
  // 🇩🇪  BUNDESLIGA — Allemagne
  // ══════════════════════════════════════════════════════════════════════════

  // ── Bayern Munich ─────────────────────────────────────────────────────────
  { api_id: 874,    name: 'Harry Kane',            age: 32, shirt_number: 9,  position: 'Attacker',   league: 'Bundesliga',     nationality: 'England',     club: 'Bayern Munich' },
  { api_id: 47509,  name: 'Jamal Musiala',         age: 23, shirt_number: 42, position: 'Midfielder', league: 'Bundesliga',     nationality: 'Germany',     club: 'Bayern Munich' },
  { api_id: 2285,   name: 'Manuel Neuer',          age: 39, shirt_number: 1,  position: 'Goalkeeper', league: 'Bundesliga',     nationality: 'Germany',     club: 'Bayern Munich' },
  { api_id: 47166,  name: 'Leroy Sané',            age: 30, shirt_number: 10, position: 'Attacker',   league: 'Bundesliga',     nationality: 'Germany',     club: 'Bayern Munich' },

  // ── Bayer Leverkusen ──────────────────────────────────────────────────────
  { api_id: 47486,  name: 'Florian Wirtz',         age: 22, shirt_number: 10, position: 'Midfielder', league: 'Bundesliga',     nationality: 'Germany',     club: 'Bayer Leverkusen' },
  { api_id: 1050,   name: 'Granit Xhaka',          age: 33, shirt_number: 34, position: 'Midfielder', league: 'Bundesliga',     nationality: 'Switzerland', club: 'Bayer Leverkusen' },
  { api_id: 37448,  name: 'Alejandro Grimaldo',    age: 30, shirt_number: 12, position: 'Defender',   league: 'Bundesliga',     nationality: 'Spain',       club: 'Bayer Leverkusen' },
  { api_id: 374193, name: 'Piero Hincapié',        age: 24, shirt_number: 3,  position: 'Defender',   league: 'Bundesliga',     nationality: 'Ecuador',     club: 'Bayer Leverkusen' },

  // ── Borussia Dortmund ─────────────────────────────────────────────────────
  { api_id: 295534, name: 'Gregor Kobel',          age: 28, shirt_number: 1,  position: 'Goalkeeper', league: 'Bundesliga',     nationality: 'Switzerland', club: 'Borussia Dortmund' },
  { api_id: 332766, name: 'Serhou Guirassy',       age: 29, shirt_number: 19, position: 'Attacker',   league: 'Bundesliga',     nationality: 'Guinea',      club: 'Borussia Dortmund' },
  { api_id: 374196, name: 'Karim Adeyemi',         age: 24, shirt_number: 27, position: 'Attacker',   league: 'Bundesliga',     nationality: 'Germany',     club: 'Borussia Dortmund' },
  { api_id: 44019,  name: 'Julian Brandt',         age: 30, shirt_number: 10, position: 'Midfielder', league: 'Bundesliga',     nationality: 'Germany',     club: 'Borussia Dortmund' },

  // ── RB Leipzig ────────────────────────────────────────────────────────────
  { api_id: 401897, name: 'Lois Openda',           age: 25, shirt_number: 27, position: 'Attacker',   league: 'Bundesliga',     nationality: 'Belgium',     club: 'RB Leipzig' },
  { api_id: 415161, name: 'Benjamin Šeško',        age: 22, shirt_number: 30, position: 'Attacker',   league: 'Bundesliga',     nationality: 'Slovenia',    club: 'RB Leipzig' },
  { api_id: 415246, name: 'Xavi Simons',           age: 23, shirt_number: 10, position: 'Midfielder', league: 'Bundesliga',     nationality: 'Netherlands', club: 'RB Leipzig' },
  { api_id: 158,    name: 'Peter Gulacsi',         age: 35, shirt_number: 1,  position: 'Goalkeeper', league: 'Bundesliga',     nationality: 'Hungary',     club: 'RB Leipzig' },

  // ══════════════════════════════════════════════════════════════════════════
  // 🇮🇹  SERIE A — Italie
  // ══════════════════════════════════════════════════════════════════════════

  // ── Inter Milan ───────────────────────────────────────────────────────────
  { api_id: 26327,  name: 'Lautaro Martínez',      age: 28, shirt_number: 10, position: 'Attacker',   league: 'Serie A',        nationality: 'Argentina',   club: 'Inter Milan' },
  { api_id: 282671, name: 'Nicolò Barella',        age: 28, shirt_number: 23, position: 'Midfielder', league: 'Serie A',        nationality: 'Italy',       club: 'Inter Milan' },
  { api_id: 184001, name: 'Marcus Thuram',         age: 28, shirt_number: 9,  position: 'Attacker',   league: 'Serie A',        nationality: 'France',      club: 'Inter Milan' },
  { api_id: 25722,  name: 'Hakan Çalhanoğlu',      age: 31, shirt_number: 20, position: 'Midfielder', league: 'Serie A',        nationality: 'Turkey',      club: 'Inter Milan' },

  // ── AC Milan ──────────────────────────────────────────────────────────────
  { api_id: 340782, name: 'Rafael Leão',           age: 26, shirt_number: 10, position: 'Attacker',   league: 'Serie A',        nationality: 'Portugal',    club: 'AC Milan' },
  { api_id: 288618, name: 'Theo Hernández',        age: 28, shirt_number: 19, position: 'Defender',   league: 'Serie A',        nationality: 'France',      club: 'AC Milan' },
  { api_id: 374180, name: 'Tijjani Reijnders',     age: 27, shirt_number: 14, position: 'Midfielder', league: 'Serie A',        nationality: 'Netherlands', club: 'AC Milan' },
  { api_id: 41885,  name: 'Mike Maignan',          age: 30, shirt_number: 16, position: 'Goalkeeper', league: 'Serie A',        nationality: 'France',      club: 'AC Milan' },

  // ── Juventus ──────────────────────────────────────────────────────────────
  { api_id: 293434, name: 'Dušan Vlahović',        age: 26, shirt_number: 9,  position: 'Attacker',   league: 'Serie A',        nationality: 'Serbia',      club: 'Juventus' },
  { api_id: 295461, name: 'Teun Koopmeiners',      age: 27, shirt_number: 8,  position: 'Midfielder', league: 'Serie A',        nationality: 'Netherlands', club: 'Juventus' },
  { api_id: 310082, name: 'Douglas Luiz',          age: 28, shirt_number: 6,  position: 'Midfielder', league: 'Serie A',        nationality: 'Brazil',      club: 'Juventus' },
  { api_id: 350158, name: 'Federico Gatti',        age: 27, shirt_number: 4,  position: 'Defender',   league: 'Serie A',        nationality: 'Italy',       club: 'Juventus' },

  // ── Napoli ────────────────────────────────────────────────────────────────
  { api_id: 629,    name: 'Kevin De Bruyne',       age: 34, shirt_number: 5,  position: 'Midfielder', league: 'Serie A',        nationality: 'Belgium',     club: 'Napoli' },
  { api_id: 275877, name: 'Victor Osimhen',        age: 27, shirt_number: 9,  position: 'Attacker',   league: 'Serie A',        nationality: 'Nigeria',     club: 'Napoli' },
  { api_id: 310958, name: 'Alessandro Buongiorno', age: 26, shirt_number: 4,  position: 'Defender',   league: 'Serie A',        nationality: 'Italy',       club: 'Napoli' },
  { api_id: 330,    name: 'Alex Meret',            age: 28, shirt_number: 1,  position: 'Goalkeeper', league: 'Serie A',        nationality: 'Italy',       club: 'Napoli' },

  // ══════════════════════════════════════════════════════════════════════════
  // 🇫🇷  LIGUE 1 — France
  // ══════════════════════════════════════════════════════════════════════════

  // ── Paris Saint-Germain ───────────────────────────────────────────────────
  { api_id: 1467,   name: 'Gianluigi Donnarumma',  age: 27, shirt_number: 99, position: 'Goalkeeper', league: 'Ligue 1',        nationality: 'Italy',       club: 'Paris Saint-Germain' },
  { api_id: 342908, name: 'Ousmane Dembélé',       age: 28, shirt_number: 10, position: 'Attacker',   league: 'Ligue 1',        nationality: 'France',      club: 'Paris Saint-Germain' },
  { api_id: 415028, name: 'Bradley Barcola',       age: 23, shirt_number: 29, position: 'Attacker',   league: 'Ligue 1',        nationality: 'France',      club: 'Paris Saint-Germain' },
  { api_id: 387003, name: 'Gonçalo Ramos',         age: 24, shirt_number: 9,  position: 'Attacker',   league: 'Ligue 1',        nationality: 'Portugal',    club: 'Paris Saint-Germain' },
  { api_id: 348808, name: 'Khvicha Kvaratskhelia', age: 24, shirt_number: 7,  position: 'Attacker',   league: 'Ligue 1',        nationality: 'Georgia',     club: 'Paris Saint-Germain' },

  // ── Monaco ────────────────────────────────────────────────────────────────
  { api_id: 159002, name: 'Folarin Balogun',       age: 24, shirt_number: 9,  position: 'Attacker',   league: 'Ligue 1',        nationality: 'United States', club: 'Monaco' },
  { api_id: 17899,  name: 'Aleksandr Golovin',     age: 29, shirt_number: 17, position: 'Midfielder', league: 'Ligue 1',        nationality: 'Russia',      club: 'Monaco' },
  { api_id: 374208, name: 'Wilfried Singo',        age: 25, shirt_number: 2,  position: 'Defender',   league: 'Ligue 1',        nationality: 'Ivory Coast', club: 'Monaco' },

  // ── Marseille ─────────────────────────────────────────────────────────────
  { api_id: 288614, name: 'Mason Greenwood',       age: 24, shirt_number: 10, position: 'Attacker',   league: 'Ligue 1',        nationality: 'England',     club: 'Marseille' },
  { api_id: 374169, name: 'Elye Wahi',             age: 22, shirt_number: 9,  position: 'Attacker',   league: 'Ligue 1',        nationality: 'France',      club: 'Marseille' },
  { api_id: 159476, name: 'Valentin Rongier',      age: 30, shirt_number: 21, position: 'Midfielder', league: 'Ligue 1',        nationality: 'France',      club: 'Marseille' },
  { api_id: 384,    name: 'Geronimo Rulli',        age: 33, shirt_number: 30, position: 'Goalkeeper', league: 'Ligue 1',        nationality: 'Argentina',   club: 'Marseille' },

  // ── Lille ─────────────────────────────────────────────────────────────────
  { api_id: 415129, name: 'Jonathan David',        age: 25, shirt_number: 9,  position: 'Attacker',   league: 'Ligue 1',        nationality: 'Canada',      club: 'Lille' },
  { api_id: 374152, name: 'Leny Yoro',             age: 20, shirt_number: 4,  position: 'Defender',   league: 'Ligue 1',        nationality: 'France',      club: 'Lille' },
  { api_id: 374148, name: 'Edon Zhegrova',         age: 26, shirt_number: 10, position: 'Attacker',   league: 'Ligue 1',        nationality: 'Kosovo',      club: 'Lille' },

];

// ─── Photo URL → toujours basée sur l'api_id (CDN public api-sports.io) ──────
const getPhotoUrl = (api_id) =>
  `https://media.api-sports.io/football/players/${api_id}.png`;

const seed = async () => {
  const client = await pool.connect();
  try {
    await client.query('DELETE FROM players');

    let inserted = 0;
    for (const player of players) {
      await client.query(
        `INSERT INTO players
           (api_id, name, age, shirt_number, position, league, nationality, club, photo_url, season)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 2025)
         ON CONFLICT (api_id) DO UPDATE SET
           name         = EXCLUDED.name,
           age          = EXCLUDED.age,
           shirt_number = EXCLUDED.shirt_number,
           position     = EXCLUDED.position,
           league       = EXCLUDED.league,
           nationality  = EXCLUDED.nationality,
           club         = EXCLUDED.club,
           photo_url    = EXCLUDED.photo_url,
           season       = EXCLUDED.season`,
        [
          player.api_id,
          player.name,
          player.age,
          player.shirt_number,
          player.position,
          player.league,
          player.nationality,
          player.club,
          getPhotoUrl(player.api_id),
        ]
      );
      inserted++;
    }

    console.log(`✅ Seed terminé : ${inserted}/${players.length} joueurs insérés (saison 2025/2026).`);
    console.log(`   Répartition : 4 × Premier League | 4 × La Liga | 4 × Bundesliga | 4 × Serie A | 4 × Ligue 1`);
  } catch (err) {
    console.error('❌ Erreur seed:', err.message);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
