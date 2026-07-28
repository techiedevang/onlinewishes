import SpotifyWebApi from "spotify-web-api-node";

export default async function handler(req, res) {
  if (req.method !== 'GET') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    if (!process.env.SPOTIFY_CLIENT_ID || !process.env.SPOTIFY_CLIENT_SECRET) {
      return res.status(500).json({ error: "Spotify credentials missing." });
    }
    
    const spotifyApi = new SpotifyWebApi({
      clientId: process.env.SPOTIFY_CLIENT_ID,
      clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    });
    
    const data = await spotifyApi.clientCredentialsGrant();
    res.json({
      access_token: data.body['access_token'],
      expires_in: data.body['expires_in']
    });
  } catch (error) {
    console.error('Error getting Spotify access token', error);
    res.status(500).json({ error: "Could not get Spotify token", details: error.message || error });
  }
}
