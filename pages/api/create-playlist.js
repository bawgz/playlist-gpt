import axios from 'axios';
import { getServerSession } from "next-auth/next"

import { authOptions } from './auth/[...nextauth]'

const SPOTIFY_BASE_URL = "https://api.spotify.com/v1";

export default async function (req, res) {

  try {
    const session = await getServerSession(req, res, authOptions);

    const profileResponse = await axios.get(
      `${SPOTIFY_BASE_URL}/me`,
      { headers: { 'Authorization': `Bearer ${session.accessToken}` } }
    );

    console.log("------------profileResponse----------------");
    console.log(profileResponse);

    const profileId = profileResponse.data.id;

    const playlistRequestData = {
      "name": req.body.theme,
      "public": false
    };

    const createPlaylistResponse = await axios.post(
      `${SPOTIFY_BASE_URL}/users/${profileId}/playlists`,
      playlistRequestData,
      { headers: { 'Authorization': `Bearer ${session.accessToken}` } }
    );

    console.log("-------response-----------");
    console.log(createPlaylistResponse);

    const promises = req.body.songs.map(song => searchSpotify(song.song, song.artist, session.accessToken));
    const searchResults = await Promise.all(promises);

    console.log(searchResults);

    const addSongsResult = await addSongs(createPlaylistResponse.data.id, searchResults, session.accessToken);

    console.log(addSongsResult);

    res.status(200).json({ id: createPlaylistResponse.data.id });
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with Spotify API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}

async function searchSpotify(track, artist, accessToken) {

  const resp = await axios.get(
    `${SPOTIFY_BASE_URL}/search?q=${track} ${artist}&type=track&limit=1`,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );

  return resp.data.tracks.items[0]?.id;
}

async function addSongs(playlistId, songIds, accessToken) {
  const addSongsRequest = {
    uris: songIds.map(id => `spotify:track:${id}`)
  };

  const response = await axios.post(
    `${SPOTIFY_BASE_URL}/playlists/${playlistId}/tracks`,
    addSongsRequest,
    { headers: { 'Authorization': `Bearer ${accessToken}` } }
  );

  console.log(response);
}
