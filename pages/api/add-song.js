import { Configuration, OpenAIApi } from "openai";

const configuration = new Configuration({
  apiKey: process.env.OPENAI_API_KEY,
});
const openai = new OpenAIApi(configuration);

export default async function (req, res) {
  if (!configuration.apiKey) {
    res.status(500).json({
      error: {
        message: "OpenAI API key not configured, please follow instructions in README.md",
      }
    });
    return;
  }

  const theme = req.body.theme || '';
  if (theme.trim().length === 0) {
    res.status(400).json({
      error: {
        message: "Please enter a valid theme",
      }
    });
    return;
  }

  const songs = req.body.songs;
  const removedSongs = req.body.removedSongs;

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are PlaylistGPT, a large language model specializing in generating playlists based on a theme. Your responses should be a JSON object with fields for song, artist, and reason. The songs should be real and should be popular within their respective genres." },
        {
          role: "user",
          content: `Please respond with a song that would fit well in this playlist: ${JSON.stringify(songs)}.
            The song should fit in this theme: ${theme}.
            It should not be a song contained in this list: ${JSON.stringify(removedSongs)}`
        }
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    console.log(completion.data);
    res.status(200).json(JSON.parse(completion.data.choices[0].message.content));
  } catch (error) {
    if (error.response) {
      console.error(error.response.status, error.response.data);
      res.status(error.response.status).json(error.response.data);
    } else {
      console.error(`Error with OpenAI API request: ${error.message}`);
      res.status(500).json({
        error: {
          message: 'An error occurred during your request.',
        }
      });
    }
  }
}
