const { sequelize, Band, User } = require('../models');
const axios = require('axios');

// Spotify API credentials from env
const SPOTIFY_CLIENT_ID = process.env.SPOTIFY_CLIENT_ID;
const SPOTIFY_CLIENT_SECRET = process.env.SPOTIFY_CLIENT_SECRET;

let spotifyToken = null;

async function getSpotifyToken() {
  if (spotifyToken) return spotifyToken;

  try {
    const response = await axios.post(
      'https://accounts.spotify.com/api/token',
      'grant_type=client_credentials',
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': 'Basic ' + Buffer.from(`${SPOTIFY_CLIENT_ID}:${SPOTIFY_CLIENT_SECRET}`).toString('base64')
        }
      }
    );
    spotifyToken = response.data.access_token;
    return spotifyToken;
  } catch (error) {
    console.error('Error getting Spotify token:', error.message);
    return null;
  }
}

async function searchSpotifyArtist(artistName) {
  try {
    const token = await getSpotifyToken();
    if (!token) return null;

    const response = await axios.get('https://api.spotify.com/v1/search', {
      params: {
        q: artistName,
        type: 'artist',
        limit: 1
      },
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    if (response.data.artists.items.length > 0) {
      const artist = response.data.artists.items[0];
      return {
        spotifyId: artist.id,
        spotifyUrl: artist.external_urls.spotify,
        spotifyImageUrl: artist.images[0]?.url || null,
        genre: artist.genres[0] || null,
        isVerified: true
      };
    }
    return null;
  } catch (error) {
    console.error(`Error searching Spotify for ${artistName}:`, error.message);
    return null;
  }
}

const sampleBands = [
  // Spain
  { name: 'Morgan', city: 'Madrid', country: 'Spain', latitude: 40.4168, longitude: -3.7038 },
  { name: 'Niña Coyote eta Chico Tornado', city: 'Bilbao', country: 'Spain', latitude: 43.2627, longitude: -2.9253 },
  { name: 'The Crab Apples', city: 'Barcelona', country: 'Spain', latitude: 41.3874, longitude: 2.1686 },

  // Mexico
  { name: 'Sgt. Papers', city: 'Ciudad de México', country: 'Mexico', latitude: 19.4326, longitude: -99.1332 },
  { name: 'Los Blenders', city: 'Tijuana', country: 'Mexico', latitude: 32.5149, longitude: -117.0382 },
  { name: 'Camilo Séptimo', city: 'Guadalajara', country: 'Mexico', latitude: 20.6597, longitude: -103.3496 },

  // Argentina
  { name: 'Bestia Bebé', city: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  { name: 'Mi Amigo Invencible', city: 'Buenos Aires', country: 'Argentina', latitude: -34.6037, longitude: -58.3816 },
  { name: 'El Mató a un Policía Motorizado', city: 'La Plata', country: 'Argentina', latitude: -34.9214, longitude: -57.9544 },

  // Chile
  { name: 'Niños del Cerro', city: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693 },
  { name: 'Paracaidistas', city: 'Santiago', country: 'Chile', latitude: -33.4489, longitude: -70.6693 },

  // Colombia
  { name: "Oh'Laville", city: 'Bogotá', country: 'Colombia', latitude: 4.7110, longitude: -74.0721 },
  { name: 'LosPetitFellas', city: 'Medellín', country: 'Colombia', latitude: 6.2442, longitude: -75.5812 },

  // USA
  { name: 'Dogleg', city: 'Detroit', country: 'United States', latitude: 42.3314, longitude: -83.0458 },
  { name: 'Illiterate Light', city: 'Harrisonburg', country: 'United States', latitude: 38.4496, longitude: -78.8689 },
  { name: 'The Backseat Lovers', city: 'Salt Lake City', country: 'United States', latitude: 40.7608, longitude: -111.8910 },

  // UK
  { name: 'Yard Act', city: 'Leeds', country: 'United Kingdom', latitude: 53.8008, longitude: -1.5491 },
  { name: 'The Mysterines', city: 'Liverpool', country: 'United Kingdom', latitude: 53.4084, longitude: -2.9916 },
  { name: 'Do Nothing', city: 'Nottingham', country: 'United Kingdom', latitude: 52.9548, longitude: -1.1581 }
];

async function seedBands() {
  try {
    console.log('Connecting to database...');
    await sequelize.authenticate();
    console.log('Database connected successfully.');

    // Get the first user (or create a default one)
    let user = await User.findOne();
    if (!user) {
      console.log('No user found. Creating default user...');
      user = await User.create({
        username: 'admin',
        email: 'admin@localnoise.com',
        password: 'placeholder' // This won't work for login but is just for seeding
      });
      console.log('Default user created.');
    }

    console.log(`Using user: ${user.username} (ID: ${user.id})`);
    console.log('\nStarting to seed bands...\n');

    for (const bandData of sampleBands) {
      try {
        // Check if band already exists
        const existingBand = await Band.findOne({ where: { name: bandData.name } });
        if (existingBand) {
          console.log(`⏭️  Skipping ${bandData.name} - already exists`);
          continue;
        }

        console.log(`🔍 Searching Spotify for: ${bandData.name}`);
        const spotifyData = await searchSpotifyArtist(bandData.name);

        // Wait a bit to avoid rate limiting
        await new Promise(resolve => setTimeout(resolve, 300));

        const band = await Band.create({
          ...bandData,
          ...spotifyData,
          addedBy: user.id,
          isActive: true
        });

        console.log(`✅ Added: ${band.name} from ${band.city}, ${band.country}`);
        if (spotifyData) {
          console.log(`   Genre: ${spotifyData.genre || 'N/A'}`);
        }
        console.log('');
      } catch (error) {
        console.error(`❌ Error adding ${bandData.name}:`, error.message);
      }
    }

    console.log('\n✨ Seeding completed!');
    process.exit(0);
  } catch (error) {
    console.error('Fatal error during seeding:', error);
    process.exit(1);
  }
}

// Run the seed script
seedBands();
