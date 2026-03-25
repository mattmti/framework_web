require('dotenv').config();
const { Pool } = require('pg');

const pool = new Pool({
  host: process.env.DB_HOST,
  port: process.env.DB_PORT,
  database: process.env.DB_NAME,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
});

const players = [
  // Premier League
  { api_id: 10001, name: 'Erling Haaland', age: 24, shirt_number: 9, position: 'Attacker', league: 'Premier League', nationality: 'Norway', club: 'Manchester City', photo_url: 'https://media.api-sports.io/football/players/1100.png' },
  { api_id: 10002, name: 'Mohamed Salah', age: 32, shirt_number: 11, position: 'Attacker', league: 'Premier League', nationality: 'Egypt', club: 'Liverpool', photo_url: 'https://media.api-sports.io/football/players/306.png' },
  { api_id: 10003, name: 'Kevin De Bruyne', age: 33, shirt_number: 17, position: 'Midfielder', league: 'Premier League', nationality: 'Belgium', club: 'Manchester City', photo_url: 'https://media.api-sports.io/football/players/629.png' },
  { api_id: 10004, name: 'Bukayo Saka', age: 23, shirt_number: 7, position: 'Midfielder', league: 'Premier League', nationality: 'England', club: 'Arsenal', photo_url: 'https://media.api-sports.io/football/players/18846.png' },
  { api_id: 10005, name: 'Virgil van Dijk', age: 33, shirt_number: 4, position: 'Defender', league: 'Premier League', nationality: 'Netherlands', club: 'Liverpool', photo_url: 'https://media.api-sports.io/football/players/1485.png' },
  { api_id: 10006, name: 'Alisson', age: 32, shirt_number: 1, position: 'Goalkeeper', league: 'Premier League', nationality: 'Brazil', club: 'Liverpool', photo_url: 'https://media.api-sports.io/football/players/1471.png' },
  { api_id: 10007, name: 'Bruno Fernandes', age: 30, shirt_number: 8, position: 'Midfielder', league: 'Premier League', nationality: 'Portugal', club: 'Manchester United', photo_url: 'https://media.api-sports.io/football/players/881.png' },
  { api_id: 10008, name: 'Son Heung-min', age: 32, shirt_number: 7, position: 'Attacker', league: 'Premier League', nationality: 'South Korea', club: 'Tottenham', photo_url: 'https://media.api-sports.io/football/players/832.png' },
  { api_id: 10009, name: 'Ederson', age: 31, shirt_number: 31, position: 'Goalkeeper', league: 'Premier League', nationality: 'Brazil', club: 'Manchester City', photo_url: 'https://media.api-sports.io/football/players/1447.png' },
  { api_id: 10010, name: 'Declan Rice', age: 25, shirt_number: 41, position: 'Midfielder', league: 'Premier League', nationality: 'England', club: 'Arsenal', photo_url: 'https://media.api-sports.io/football/players/18830.png' },

  // La Liga
  { api_id: 20001, name: 'Kylian Mbappé', age: 26, shirt_number: 9, position: 'Attacker', league: 'La Liga', nationality: 'France', club: 'Real Madrid', photo_url: 'https://media.api-sports.io/football/players/640.png' },
  { api_id: 20002, name: 'Vinicius Junior', age: 24, shirt_number: 7, position: 'Attacker', league: 'La Liga', nationality: 'Brazil', club: 'Real Madrid', photo_url: 'https://media.api-sports.io/football/players/1448.png' },
  { api_id: 20003, name: 'Robert Lewandowski', age: 36, shirt_number: 9, position: 'Attacker', league: 'La Liga', nationality: 'Poland', club: 'Barcelona', photo_url: 'https://media.api-sports.io/football/players/9985.png' },
  { api_id: 20004, name: 'Jude Bellingham', age: 21, shirt_number: 5, position: 'Midfielder', league: 'La Liga', nationality: 'England', club: 'Real Madrid', photo_url: 'https://media.api-sports.io/football/players/45656.png' },
  { api_id: 20005, name: 'Lamine Yamal', age: 17, shirt_number: 19, position: 'Attacker', league: 'La Liga', nationality: 'Spain', club: 'Barcelona', photo_url: 'https://media.api-sports.io/football/players/330609.png' },
  { api_id: 20006, name: 'Thibaut Courtois', age: 32, shirt_number: 1, position: 'Goalkeeper', league: 'La Liga', nationality: 'Belgium', club: 'Real Madrid', photo_url: 'https://media.api-sports.io/football/players/629.png' },
  { api_id: 20007, name: 'Pedri', age: 22, shirt_number: 8, position: 'Midfielder', league: 'La Liga', nationality: 'Spain', club: 'Barcelona', photo_url: 'https://media.api-sports.io/football/players/47499.png' },
  { api_id: 20008, name: 'Antoine Griezmann', age: 33, shirt_number: 7, position: 'Attacker', league: 'La Liga', nationality: 'France', club: 'Atletico Madrid', photo_url: 'https://media.api-sports.io/football/players/153.png' },
  { api_id: 20009, name: 'Marc-André ter Stegen', age: 32, shirt_number: 1, position: 'Goalkeeper', league: 'La Liga', nationality: 'Germany', club: 'Barcelona', photo_url: 'https://media.api-sports.io/football/players/265.png' },
  { api_id: 20010, name: 'Federico Valverde', age: 26, shirt_number: 15, position: 'Midfielder', league: 'La Liga', nationality: 'Uruguay', club: 'Real Madrid', photo_url: 'https://media.api-sports.io/football/players/1482.png' },

  // Serie A
  { api_id: 30001, name: 'Victor Osimhen', age: 26, shirt_number: 9, position: 'Attacker', league: 'Serie A', nationality: 'Nigeria', club: 'Napoli', photo_url: 'https://media.api-sports.io/football/players/1100.png' },
  { api_id: 30002, name: 'Lautaro Martinez', age: 27, shirt_number: 10, position: 'Attacker', league: 'Serie A', nationality: 'Argentina', club: 'Inter', photo_url: 'https://media.api-sports.io/football/players/1482.png' },
  { api_id: 30003, name: 'Rafael Leão', age: 25, shirt_number: 10, position: 'Attacker', league: 'Serie A', nationality: 'Portugal', club: 'AC Milan', photo_url: 'https://media.api-sports.io/football/players/30551.png' },
  { api_id: 30004, name: 'Khvicha Kvaratskhelia', age: 23, shirt_number: 77, position: 'Attacker', league: 'Serie A', nationality: 'Georgia', club: 'Napoli', photo_url: 'https://media.api-sports.io/football/players/61653.png' },
  { api_id: 30005, name: 'Dusan Vlahovic', age: 24, shirt_number: 9, position: 'Attacker', league: 'Serie A', nationality: 'Serbia', club: 'Juventus', photo_url: 'https://media.api-sports.io/football/players/30986.png' },
  { api_id: 30006, name: 'Mike Maignan', age: 29, shirt_number: 16, position: 'Goalkeeper', league: 'Serie A', nationality: 'France', club: 'AC Milan', photo_url: 'https://media.api-sports.io/football/players/2935.png' },
  { api_id: 30007, name: 'Nicolo Barella', age: 27, shirt_number: 23, position: 'Midfielder', league: 'Serie A', nationality: 'Italy', club: 'Inter', photo_url: 'https://media.api-sports.io/football/players/30889.png' },
  { api_id: 30008, name: 'Paulo Dybala', age: 31, shirt_number: 21, position: 'Attacker', league: 'Serie A', nationality: 'Argentina', club: 'AS Roma', photo_url: 'https://media.api-sports.io/football/players/1451.png' },
  { api_id: 30009, name: 'Alessandro Bastoni', age: 25, shirt_number: 95, position: 'Defender', league: 'Serie A', nationality: 'Italy', club: 'Inter', photo_url: 'https://media.api-sports.io/football/players/30842.png' },
  { api_id: 30010, name: 'Theo Hernandez', age: 27, shirt_number: 19, position: 'Defender', league: 'Serie A', nationality: 'France', club: 'AC Milan', photo_url: 'https://media.api-sports.io/football/players/1447.png' },

  // Bundesliga
  { api_id: 40001, name: 'Harry Kane', age: 31, shirt_number: 9, position: 'Attacker', league: 'Bundesliga', nationality: 'England', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/874.png' },
  { api_id: 40002, name: 'Jamal Musiala', age: 21, shirt_number: 42, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/47509.png' },
  { api_id: 40003, name: 'Leroy Sané', age: 29, shirt_number: 10, position: 'Attacker', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/655.png' },
  { api_id: 40004, name: 'Joshua Kimmich', age: 29, shirt_number: 6, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/882.png' },
  { api_id: 40005, name: 'Florian Wirtz', age: 21, shirt_number: 10, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany', club: 'Bayer Leverkusen', photo_url: 'https://media.api-sports.io/football/players/47486.png' },
  { api_id: 40006, name: 'Manuel Neuer', age: 38, shirt_number: 1, position: 'Goalkeeper', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/218.png' },
  { api_id: 40007, name: 'Serge Gnabry', age: 29, shirt_number: 7, position: 'Attacker', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/691.png' },
  { api_id: 40008, name: 'Thomas Müller', age: 35, shirt_number: 25, position: 'Midfielder', league: 'Bundesliga', nationality: 'Germany', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/217.png' },
  { api_id: 40009, name: 'Alphonso Davies', age: 24, shirt_number: 19, position: 'Defender', league: 'Bundesliga', nationality: 'Canada', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/31125.png' },
  { api_id: 40010, name: 'Dayot Upamecano', age: 26, shirt_number: 2, position: 'Defender', league: 'Bundesliga', nationality: 'France', club: 'Bayern Munich', photo_url: 'https://media.api-sports.io/football/players/1447.png' },

  // Ligue 1
  { api_id: 50001, name: 'Bradley Barcola', age: 22, shirt_number: 29, position: 'Attacker', league: 'Ligue 1', nationality: 'France', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/326146.png' },
  { api_id: 50002, name: 'Ousmane Dembélé', age: 27, shirt_number: 10, position: 'Attacker', league: 'Ligue 1', nationality: 'France', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/896.png' },
  { api_id: 50003, name: 'Marquinhos', age: 30, shirt_number: 5, position: 'Defender', league: 'Ligue 1', nationality: 'Brazil', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/1447.png' },
  { api_id: 50004, name: 'Gianluigi Donnarumma', age: 25, shirt_number: 99, position: 'Goalkeeper', league: 'Ligue 1', nationality: 'Italy', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/882.png' },
  { api_id: 50005, name: 'Vitinha', age: 24, shirt_number: 17, position: 'Midfielder', league: 'Ligue 1', nationality: 'Portugal', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/47660.png' },
  { api_id: 50006, name: 'Achraf Hakimi', age: 26, shirt_number: 2, position: 'Defender', league: 'Ligue 1', nationality: 'Morocco', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/882.png' },
  { api_id: 50007, name: 'Warren Zaïre-Emery', age: 18, shirt_number: 33, position: 'Midfielder', league: 'Ligue 1', nationality: 'France', club: 'Paris Saint-Germain', photo_url: 'https://media.api-sports.io/football/players/326146.png' },
  { api_id: 50008, name: 'Pierre-Emerick Aubameyang', age: 35, shirt_number: 10, position: 'Attacker', league: 'Ligue 1', nationality: 'Gabon', club: 'Marseille', photo_url: 'https://media.api-sports.io/football/players/750.png' },
  { api_id: 50009, name: 'Alexandre Lacazette', age: 33, shirt_number: 10, position: 'Attacker', league: 'Ligue 1', nationality: 'France', club: 'Lyon', photo_url: 'https://media.api-sports.io/football/players/215.png' },
  { api_id: 50010, name: 'Jonathan David', age: 24, shirt_number: 9, position: 'Attacker', league: 'Ligue 1', nationality: 'Canada', club: 'Lille', photo_url: 'https://media.api-sports.io/football/players/18947.png' },
];

const seed = async () => {
  const client = await pool.connect();
  try {
    console.log('🌱 Début du seed des joueurs...');

    // Vider la table d'abord
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
          player.photo_url,
        ]
      );
    }

    console.log(`✅ ${players.length} joueurs ajoutés avec succès !`);
    console.log('🎮 Tu peux maintenant jouer !');
  } catch (err) {
    console.error('❌ Erreur lors du seed:', err);
  } finally {
    client.release();
    await pool.end();
  }
};

seed();