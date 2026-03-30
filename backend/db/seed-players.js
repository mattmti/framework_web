require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

// IDs réels API-Football (api_id = vrai identifiant du joueur sur api-sports.io)
// Photo URL = https://media.api-sports.io/football/players/{api_id}.png
const players = [
  // ─── Premier League ────────────────────────────────────────────────
  { api_id: 1100,  name: 'Erling Haaland',    age: 24, shirt_number: 9,  position: 'Attacker',   league: 'Premier League', nationality: 'Norway',       club: 'Manchester City' },
  { api_id: 306,   name: 'Mohamed Salah',      age: 32, shirt_number: 11, position: 'Attacker',   league: 'Premier League', nationality: 'Egypt',        club: 'Liverpool' },
  { api_id: 629,   name: 'Kevin De Bruyne',    age: 33, shirt_number: 17, position: 'Midfielder', league: 'Premier League', nationality: 'Belgium',      club: 'Manchester City' },
  { api_id: 18846, name: 'Bukayo Saka',         age: 23, shirt_number: 7,  position: 'Midfielder', league: 'Premier League', nationality: 'England',      club: 'Arsenal' },
  { api_id: 1485,  name: 'Virgil van Dijk',    age: 33, shirt_number: 4,  position: 'Defender',   league: 'Premier League', nationality: 'Netherlands',  club: 'Liverpool' },
  { api_id: 1471,  name: 'Alisson',             age: 32, shirt_number: 1,  position: 'Goalkeeper', league: 'Premier League', nationality: 'Brazil',       club: 'Liverpool' },
  { api_id: 881,   name: 'Bruno Fernandes',    age: 30, shirt_number: 8,  position: 'Midfielder', league: 'Premier League', nationality: 'Portugal',     club: 'Manchester United' },
  { api_id: 832,   name: 'Son Heung-min',      age: 32, shirt_number: 7,  position: 'Attacker',   league: 'Premier League', nationality: 'South Korea',  club: 'Tottenham' },
  { api_id: 1052,  name: 'Ederson',             age: 31, shirt_number: 31, position: 'Goalkeeper', league: 'Premier League', nationality: 'Brazil',       club: 'Manchester City' },
  { api_id: 18830, name: 'Declan Rice',         age: 25, shirt_number: 41, position: 'Midfielder', league: 'Premier League', nationality: 'England',      club: 'Arsenal' },

  // ─── La Liga ──────────────────────────────────────────────────────
  { api_id: 278,   name: 'Kylian Mbappé',      age: 26, shirt_number: 9,  position: 'Attacker',   league: 'La Liga', nationality: 'France',       club: 'Real Madrid' },
  { api_id: 24792, name: 'Vinicius Junior',     age: 24, shirt_number: 7,  position: 'Attacker',   league: 'La Liga', nationality: 'Brazil',       club: 'Real Madrid' },
  { api_id: 521,   name: 'Robert Lewandowski', age: 36, shirt_number: 9,  position: 'Attacker',   league: 'La Liga', nationality: 'Poland',       club: 'Barcelona' },
  { api_id: 167948,name: 'Jude Bellingham',    age: 21, shirt_number: 5,  position: 'Midfielder', league: 'La Liga', nationality: 'England',      club: 'Real Madrid' },
  { api_id: 415229,name: 'Lamine Yamal',        age: 17, shirt_number: 19, position: 'Attacker',   league: 'La Liga', nationality: 'Spain',        club: 'Barcelona' },
  { api_id: 8998,  name: 'Thibaut Courtois',   age: 32, shirt_number: 1,  position: 'Goalkeeper', league: 'La Liga', nationality: 'Belgium',      club: 'Real Madrid' },
  { api_id: 48750, name: 'Pedri',               age: 22, shirt_number: 8,  position: 'Midfielder', league: 'La Liga', nationality: 'Spain',        club: 'Barcelona' },
  { api_id: 153,   name: 'Antoine Griezmann',  age: 33, shirt_number: 7,  position: 'Attacker',   league: 'La Liga', nationality: 'France',       club: 'Atletico Madrid' },
  { api_id: 265,   name: 'Marc-André ter Stegen',age:32, shirt_number: 1, position: 'Goalkeeper', league: 'La Liga', nationality: 'Germany',      club: 'Barcelona' },
  { api_id: 18834, name: 'Federico Valverde',  age: 26, shirt_number: 15, position: 'Midfielder', league: 'La Liga', nationality: 'Uruguay',      club: 'Real Madrid' },

  // ─── Serie A ──────────────────────────────────────────────────────
  { api_id: 30735, name: 'Victor Osimhen',      age: 26, shirt_number: 90, position: 'Attacker',   league: 'Süper Lig',nationality: 'Nigeria',      club: 'Galatasaray' },
  { api_id: 30716, name: 'Lautaro Martinez',   age: 27, shirt_number: 10, position: 'Attacker',   league: 'Serie A', nationality: 'Argentina',    club: 'Inter' },
  { api_id: 30551, name: 'Rafael Leão',         age: 25, shirt_number: 10, position: 'Attacker',   league: 'Serie A', nationality: 'Portugal',     club: 'AC Milan' },
  { api_id: 284472,name: 'Khvicha Kvaratskhelia',age:23,shirt_number: 7,  position: 'Attacker',   league: 'Ligue 1', nationality: 'Georgia',      club: 'Paris Saint-Germain' },
  { api_id: 30986, name: 'Dusan Vlahovic',      age: 24, shirt_number: 9,  position: 'Attacker',   league: 'Serie A', nationality: 'Serbia',       club: 'Juventus' },
  { api_id: 2935,  name: 'Mike Maignan',        age: 29, shirt_number: 16, position: 'Goalkeeper', league: 'Serie A', nationality: 'France',       club: 'AC Milan' },
  { api_id: 30889, name: 'Nicolo Barella',      age: 27, shirt_number: 23, position: 'Midfielder', league: 'Serie A', nationality: 'Italy',        club: 'Inter' },
  { api_id: 1451,  name: 'Paulo Dybala',        age: 31, shirt_number: 21, position: 'Attacker',   league: 'Serie A', nationality: 'Argentina',    club: 'AS Roma' },
  { api_id: 30842, name: 'Alessandro Bastoni', age: 25, shirt_number: 95, position: 'Defender',   league: 'Serie A', nationality: 'Italy',        club: 'Inter' },
  { api_id: 18821, name: 'Theo Hernandez',      age: 27, shirt_number: 19, position: 'Defender',   league: 'Serie A', nationality: 'France',       club: 'AC Milan' },

  // ─── Bundesliga ───────────────────────────────────────────────────
  { api_id: 874,   name: 'Harry Kane',          age: 31, shirt_number: 9,  position: 'Attacker',   league: 'Bundesliga', nationality: 'England',      club: 'Bayern Munich' },
  { api_id: 47509, name: 'Jamal Musiala',       age: 21, shirt_number: 42, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 655,   name: 'Leroy Sané',          age: 29, shirt_number: 10, position: 'Attacker',   league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 882,   name: 'Joshua Kimmich',      age: 29, shirt_number: 6,  position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 47486, name: 'Florian Wirtz',       age: 21, shirt_number: 10, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany',      club: 'Bayer Leverkusen' },
  { api_id: 218,   name: 'Manuel Neuer',        age: 38, shirt_number: 1,  position: 'Goalkeeper', league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 691,   name: 'Serge Gnabry',        age: 29, shirt_number: 7,  position: 'Attacker',   league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 217,   name: 'Thomas Müller',       age: 35, shirt_number: 25, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany',      club: 'Bayern Munich' },
  { api_id: 31125, name: 'Alphonso Davies',     age: 24, shirt_number: 19, position: 'Defender',   league: 'Bundesliga', nationality: 'Canada',       club: 'Bayern Munich' },
  { api_id: 24850, name: 'Dayot Upamecano',     age: 26, shirt_number: 2,  position: 'Defender',   league: 'Bundesliga', nationality: 'France',       club: 'Bayern Munich' },

  // ─── Ligue 1 ──────────────────────────────────────────────────────
  { api_id: 326146,name: 'Bradley Barcola',     age: 22, shirt_number: 29, position: 'Attacker',   league: 'Ligue 1', nationality: 'France',       club: 'Paris Saint-Germain' },
  { api_id: 896,   name: 'Ousmane Dembélé',    age: 27, shirt_number: 10, position: 'Attacker',   league: 'Ligue 1', nationality: 'France',       club: 'Paris Saint-Germain' },
  { api_id: 1461,  name: 'Marquinhos',          age: 30, shirt_number: 5,  position: 'Defender',   league: 'Ligue 1', nationality: 'Brazil',       club: 'Paris Saint-Germain' },
  { api_id: 1467,  name: 'Gianluigi Donnarumma',age:25, shirt_number: 99, position: 'Goalkeeper', league: 'Ligue 1', nationality: 'Italy',        club: 'Paris Saint-Germain' },
  { api_id: 47660, name: 'Vitinha',             age: 24, shirt_number: 17, position: 'Midfielder', league: 'Ligue 1', nationality: 'Portugal',     club: 'Paris Saint-Germain' },
  { api_id: 18960, name: 'Achraf Hakimi',       age: 26, shirt_number: 2,  position: 'Defender',   league: 'Ligue 1', nationality: 'Morocco',      club: 'Paris Saint-Germain' },
  { api_id: 326226,name: 'Warren Zaïre-Emery', age: 18, shirt_number: 33, position: 'Midfielder', league: 'Ligue 1', nationality: 'France',       club: 'Paris Saint-Germain' },
  { api_id: 750,   name: 'Pierre-Emerick Aubameyang',age:35,shirt_number:10,position:'Attacker',  league: 'Ligue 1', nationality: 'Gabon',        club: 'Marseille' },
  { api_id: 215,   name: 'Alexandre Lacazette', age: 33, shirt_number: 10, position: 'Attacker',   league: 'Ligue 1', nationality: 'France',       club: 'Lyon' },
  { api_id: 18947, name: 'Jonathan David',      age: 24, shirt_number: 9,  position: 'Attacker',   league: 'Ligue 1', nationality: 'Canada',       club: 'Lille' },
];

// Construction automatique de la photo URL depuis l'api_id réel
const getPhotoUrl = (api_id) =>
  `https://media.api-sports.io/football/players/${api_id}.png`;

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Début du seed des joueurs...');

    await client.query('DELETE FROM players');
    console.log('🗑️  Table players vidée');

    for (const player of players) {
      await client.query(
        `INSERT INTO players (api_id, name, age, shirt_number, position, league, nationality, club, photo_url, season)
         VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, 2024)`,
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
    }

    console.log(`✅ ${players.length} joueurs ajoutés avec succès !`);
    console.log('📸 Photos construites depuis les vrais IDs API-Football');
    console.log('🎮 Tu peux maintenant jouer !');
  } catch (err) {
    console.error('❌ Erreur lors du seed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();
