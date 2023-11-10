import Head from "next/head";
import { useState } from "react";
import Box from '@mui/material/Box';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import Button from '@mui/material/Button';
import ListItemText from '@mui/material/ListItemText';
import { useSession } from "next-auth/react";
import { useRouter } from 'next/router';
import { useEffect } from 'react';
import styles from "./index.module.css";

export default function Home() {
  const [themeInput, setThemeInput] = useState("");
  const [result, setResult] = useState([]);
  const [removed, setRemoved] = useState([]);

  const { data: session, status } = useSession()

  const router = useRouter();

  useEffect(() => {
    if (!session && status !== "loading") {
      console.log("rerouting");
      router.push('api/auth/signin');
    }
  });

  async function onSubmit(event) {
    event.preventDefault();
    try {
      const response = await fetch("/api/generate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: themeInput }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log(data);
      setResult(data);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  async function addSong() {
    try {
      const response = await fetch("/api/add-song", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: themeInput, songs: result, removedSongs: removed }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }

      console.log(data);
      setResult([...result, data]);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  function onRemove(index) {
    setRemoved([...removed, result[index]]);
    const filteredResult = result.filter((_, i) => i !== index);
    setResult(filteredResult);
  }

  async function createPlaylist() {
    try {
      const response = await fetch("/api/create-playlist", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ theme: themeInput, songs: result }),
      });

      const data = await response.json();
      if (response.status !== 200) {
        throw data.error || new Error(`Request failed with status ${response.status}`);
      }
      console.log(data.id);
    } catch (error) {
      console.error(error);
      alert(error.message);
    }
  }

  return (
    <div>
      <Head>
        <title>PlaylistGPT</title>
        <link rel="icon" href="/music-note.png" />
      </Head>

      <main className={styles.main}>
        <img src="/music-note.png" className={styles.icon} />
        <h3>Generate a playlist</h3>
        <form onSubmit={onSubmit}>
          <input
            type="text"
            name="theme"
            placeholder="Enter a theme"
            value={themeInput}
            onChange={(e) => setThemeInput(e.target.value)}
          />
          <input type="submit" value="Generate playlist" />
        </form>
        <Box sx={{ width: '100%', maxWidth: 360, bgcolor: 'background.paper' }}>
          <List>
            {result.map((r, i) => (
              <ListItem key={i} disablePadding>
                <Button onClick={() => onRemove(i)}>-</Button>
                <ListItemText primary={`${r.song} - ${r.artist} (${r.reason})`} />
              </ListItem>
            ))}
          </List>
          {
            result.length > 0 &&
            <div>
              <Button onClick={addSong}>+</Button>
              <Button onClick={createPlaylist}>Create Spotify Playlist</Button>
            </div>
          }
        </Box>
      </main>
    </div>
  );
}
