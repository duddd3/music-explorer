import React, { useState, useEffect, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { Sidebar } from './components/Sidebar';
import { Player } from './components/Player';
import { InfoArea } from './components/InfoArea';
import { supabase } from './supabaseClient';

const theme = {
  background: '#181A2A',
  surface: '#23254A',
  primary: '#7C3AED',
  accent: '#7C3AED',
  text: '#FFFFFF',
  textSecondary: '#A3A3C2',
  button: '#3B3E66',
  buttonActive: '#7C3AED',
  border: '#313265',
};

const GlobalStyle = createGlobalStyle`
  body {
    background: ${props => props.theme.background};
    color: ${props => props.theme.text};
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
  background: ${props => props.theme.surface};
  padding: 0 2rem;
  overflow: auto;
`;

const App: React.FC = () => {
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

  interface Filters {
    search: string;
    decade: string | null;
    genre: string | null;
    subgenre: string | null;
    country: string | null;
    language: string | null;
  }

  const [allSongs, setAllSongs] = useState<Song[]>([]);
  const [filteredSongs, setFilteredSongs] = useState<Song[]>([]);
  const [currentSong, setCurrentSong] = useState<Song | null>(null);
  const [infoTab, setInfoTab] = useState<'lyrics' | 'history' | 'theory'>('lyrics');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [filters, setFilters] = useState<Filters>({
    search: '',
    decade: null,
    genre: null,
    subgenre: null,
    country: null,
    language: null
  });

  // Fetch all songs
  useEffect(() => {
    const fetchSongs = async () => {
      setLoading(true);
      setError(null);
      try {
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

        if (error) {
          console.error('Supabase error:', error);
          if (error.message.includes('permission denied')) {
            setError('Unable to access songs. Please check Row Level Security (RLS) policies.');
          } else {
            setError(error.message);
          }
          setAllSongs([]);
          setFilteredSongs([]);
        } else {
          setAllSongs(data || []);
          setFilteredSongs(data || []);
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

  // Apply filters
  useEffect(() => {
    let result = [...allSongs];

    // Apply search filter
    if (filters.search) {
      const searchLower = filters.search.toLowerCase();
      result = result.filter(song =>
        song.title.toLowerCase().includes(searchLower) ||
        song.artist.toLowerCase().includes(searchLower)
      );
    }

    // Apply decade filter
    if (filters.decade) {
      const decade = parseInt(filters.decade);
      result = result.filter(song =>
        Math.floor(song.year / 10) * 10 === decade
      );
    }

    // Apply genre filter
    if (filters.genre) {
      result = result.filter(song => song.genre === filters.genre);
    }

    // Apply subgenre filter
    if (filters.subgenre) {
      result = result.filter(song => song.subgenre === filters.subgenre);
    }

    // Apply country filter
    if (filters.country) {
      result = result.filter(song => song.country === filters.country);
    }

    // Apply language filter
    if (filters.language) {
      result = result.filter(song => song.language === filters.language);
    }

    setFilteredSongs(result);
  }, [filters, allSongs]);



  const handleExplore = useCallback(() => {
    if (filteredSongs.length > 0) {
      let newSong;
      do {
        newSong = filteredSongs[Math.floor(Math.random() * filteredSongs.length)];
      } while (newSong.id === currentSong?.id && filteredSongs.length > 1);
      setCurrentSong(newSong);
    }
  }, [filteredSongs, currentSong]);

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <Layout>
        <Sidebar 
          setCurrentSong={setCurrentSong} 
          onFiltersChange={setFilters} 
        />
        <MainContent>
          <Player 
            song={currentSong} 
            setInfoTab={setInfoTab}
            onExplore={handleExplore}

          />
          <InfoArea song={currentSong} tab={infoTab} />
          <div style={{marginTop: '2rem'}}>
            <h2>Songs ({filteredSongs.length})</h2>
            {loading ? (
              <div>Loading songs...</div>
            ) : error ? (
              <div style={{color: 'red'}}>{error}</div>
            ) : (
              <div style={{ 
                display: 'grid', 
                gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', 
                gap: '1rem',
                padding: '1rem'
              }}>
                {filteredSongs.map(song => (
                  <div 
                    key={song.id} 
                    onClick={() => setCurrentSong(song)}
                    style={{
                      cursor: 'pointer',
                      padding: '1rem',
                      borderRadius: '8px',
                      background: theme.surface,
                      border: `1px solid ${theme.border}`,
                      transition: 'all 0.2s ease-in-out',
                      transform: 'translateY(0)',
                      '&:hover': {
                        transform: 'translateY(-2px)',
                        boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
                      }
                    } as React.CSSProperties}
                  >
                    <div style={{ fontWeight: 'bold' }}>{song.title}</div>
                    <div style={{ color: theme.textSecondary }}>
                      {song.artist} • {song.year}
                    </div>
                    <div style={{ 
                      fontSize: '0.8em',
                      color: theme.textSecondary,
                      marginTop: '0.5rem'
                    }}>
                      {song.genre} • {song.country}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </MainContent>
      </Layout>
    </ThemeProvider>
  );
}
;

export default App;
