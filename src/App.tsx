import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { InfoArea } from './components/InfoArea';
import { supabase } from './supabaseClient';

const theme = {
  colors: {
    background: '#181A2A',
    surface: '#23254A',
    accent: '#7C3AED',
    text: '#FFFFFF',
    textSecondary: '#A3A3C2',
    button: '#3B3E66',
    buttonActive: '#7C3AED',
    border: '#313265',
  },
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${(props: any) => props.theme.colors.background};
    color: ${(props: any) => props.theme.colors.text};
    font-family: 'Inter', sans-serif;
    margin: 0;
    padding: 0;
  }
`;

const Layout = styled.div`
  display: flex;
  height: 100vh;
`;

const MainContent = styled.main`
  flex: 1;
  display: flex;
  flex-direction: column;
  background: ${(props) => props.theme.colors.surface};
  padding: 0 2rem;
  overflow: auto;
`;

export const App: React.FC = () => {
  interface Song {
    id: number;
    title: string;
    artist: string;
    year: number;
    genre: string;
    subgenre: string;
    country: string;
    language: string;
    youtube_link: string;
  }

  const [songs, setSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [infoTab, setInfoTab] = useState<'lyrics' | 'history' | 'theory'>('lyrics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [autoplay, setAutoplay] = useState(false);

  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
        // First check if we can access the table
        console.log('Checking table access...');
        const { data, error } = await supabase
          .from('songs')
          .select(`
            id,
            title,
            artist,
            year,
            genre,
            subgenre,
            country,
            language,
            youtube_link
          `);

        console.log('Response:', { data, error });

        if (error) {
          console.error('Supabase error:', error);
          if (error.message.includes('permission denied')) {
            setError('Unable to access songs. Please check Row Level Security (RLS) policies.');
          } else {
            setError(error.message);
          }
          setSongs([]);
        } else {
          console.log('Songs fetched successfully:', data);
          setSongs(data || []);
          // Set initial random song
          if (data && data.length > 0) {
            setCurrentSong(data[Math.floor(Math.random() * data.length)]);
          }
        }
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : 'Unknown error');
      } finally {
        setLoading(false);
      }
    };
    fetchSongs();
  }, []);

  // Handle autoplay - move to next song when current song ends
  useEffect(() => {
    if (autoplay && songs.length > 0) {
      const timer = setTimeout(() => {
        const currentIndex = currentSong ? songs.findIndex(s => s.id === currentSong.id) : -1;
        const nextIndex = currentIndex === songs.length - 1 ? 0 : currentIndex + 1;
        setCurrentSong(songs[nextIndex]);
      }, 5 * 60 * 1000); // Change song every 5 minutes

      return () => clearTimeout(timer);
    }
  }, [autoplay, currentSong, songs]);

  const handleExplore = useCallback(() => {
    if (songs.length > 0) {
      let newSong;
      do {
        newSong = songs[Math.floor(Math.random() * songs.length)];
      } while (newSong.id === currentSong?.id && songs.length > 1);
      setCurrentSong(newSong);
    }
  }, [songs, currentSong]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Sidebar setCurrentSong={setCurrentSong} />
        <MainContent>
          <Player 
        song={currentSong} 
        setInfoTab={setInfoTab}
        onExplore={handleExplore}
        onAutoplayChange={setAutoplay}
      />
          <InfoArea song={currentSong} tab={infoTab} />
          <div style={{marginTop: '2rem'}}>
            <h2>All Songs in Database</h2>
            {loading && <div>Loading songs...</div>}
            {error && <div style={{color: 'red'}}>Error: {error}</div>}
            {!loading && !error && songs.length === 0 && <div>No songs found.</div>}
            {!loading && !error && songs.length > 0 && (
              <ul style={{listStyle: 'none', padding: 0}}>
                {songs.map(song => (
                  <li key={song.id} style={{marginBottom: '1rem', background: '#23254A', borderRadius: 8, padding: '1rem'}}>
                    <div><strong>Title:</strong> {song.title}</div>
                    <div><strong>Artist:</strong> {song.artist}</div>
                    <div><strong>Year:</strong> {song.year}</div>
                    <div><strong>Genre:</strong> {song.genre}</div>
                    <div><strong>Subgenre:</strong> {song.subgenre}</div>
                    <div><strong>Country:</strong> {song.country}</div>
                    <div><strong>Language:</strong> {song.language}</div>
                    <div><strong>YouTube Link:</strong> {song.youtube_link}</div>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </MainContent>
      </Layout>
    </ThemeProvider>
  );
};

export default App;
