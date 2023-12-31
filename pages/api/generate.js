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

  try {
    const completion = await openai.createChatCompletion({
      model: "gpt-4-1106-preview",
      messages: [
        { role: "system", content: "You are PlaylistGPT, a large language model specializing in generating playlists based on a theme. Your response should be a JSON object with a playlist field. The playlist field should be an array with each element containing song, artist, and reason fields. The songs should be real and should be popular within their respective genres." },
        { role: "user", content: `Please generate a playlist of 10 songs that matches the sentiment of this theme: ${theme}.` }
      ],
      max_tokens: 2000,
      response_format: { type: "json_object" },
    });

    console.log(completion.data.choices[0].message.content);
    res.status(200).json(JSON.parse(completion.data.choices[0].message.content));
  } catch (error) {
    // Consider adjusting the error handling logic for your use case
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
