import React, { useState, useCallback, useEffect } from 'react';
import styled from 'styled-components';
import { getEmbedUrl } from '../utils/youtube';

const PlayerContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-top: 2rem;
  margin-bottom: 1rem;
`;

const SongInfo = styled.div`
  color: ${(props) => props.theme.colors.text};
  text-align: center;
  margin-bottom: 1rem;
  max-width: 600px;
  width: 100%;
`;

const Controls = styled.div`
  display: flex;
  gap: 1rem;
  margin-bottom: 1rem;
  flex-wrap: wrap;
  justify-content: center;
`;

const Button = styled.button<{ active?: boolean }>`
  background: ${(props) => props.active ? props.theme.colors.buttonActive : props.theme.colors.button};
  color: ${(props) => props.theme.colors.text};
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1.2rem;
  font-size: 1rem;
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.colors.accent};
  }
`;

const YouTubeFrame = styled.iframe`
  border: none;
  border-radius: 8px;
  width: 100%;
  max-width: 640px;
  aspect-ratio: 16/9;
  background: #000;
`;

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

interface PlayerProps {
  song: Song | null;
  setInfoTab: (tab: 'lyrics' | 'history' | 'theory') => void;
  onExplore: () => void;
  onAutoplayChange: (enabled: boolean) => void;
}

export const Player: React.FC<PlayerProps> = ({ 
  song, 
  setInfoTab, 
  onExplore,
  onAutoplayChange 
}) => {
  const [autoplay, setAutoplay] = useState(false);
  const [saved, setSaved] = useState(false);

  // Load saved state from localStorage
  useEffect(() => {
    if (song) {
      const savedSongs = JSON.parse(localStorage.getItem('savedSongs') || '[]');
      setSaved(savedSongs.includes(song.id));
    }
  }, [song]);

  const handleSave = useCallback(() => {
    if (!song) return;
    const savedSongs = JSON.parse(localStorage.getItem('savedSongs') || '[]');
    if (saved) {
      localStorage.setItem(
        'savedSongs', 
        JSON.stringify(savedSongs.filter((id: number) => id !== song.id))
      );
    } else {
      localStorage.setItem(
        'savedSongs', 
        JSON.stringify([...savedSongs, song.id])
      );
    }
    setSaved(!saved);
  }, [song, saved]);

  const handleShare = useCallback(() => {
    if (!song?.youtube_link) return;
    navigator.clipboard.writeText(song.youtube_link)
      .then(() => alert('YouTube link copied to clipboard!'))
      .catch(() => alert('Failed to copy link'));
  }, [song]);

  const handleAutoplayToggle = useCallback(() => {
    const newState = !autoplay;
    setAutoplay(newState);
    onAutoplayChange(newState);
  }, [autoplay, onAutoplayChange]);

  return (
    <PlayerContainer>
      <SongInfo>
        <div style={{ fontSize: '1.6rem', fontWeight: 'bold' }}>{song ? song.title : 'No song selected'}</div>
        <div style={{ marginTop: '0.5rem' }}>
          {song ? `${song.artist} • ${song.year} • ${song.genre} • ${song.country}` : ''}
        </div>
      </SongInfo>
      {song && (
        <YouTubeFrame
          title="YouTube Player"
          src={getEmbedUrl(song.youtube_link)}
          allow="autoplay; encrypted-media"
          allowFullScreen
        />
      )}
      <Controls>
        <Button onClick={onExplore}>Explore</Button>
        <Button 
          active={autoplay} 
          onClick={handleAutoplayToggle}
        >
          {autoplay ? 'Autoplay On' : 'Autoplay Off'}
        </Button>
        <Button 
          active={saved} 
          onClick={handleSave}
        >
          {saved ? 'Remove' : 'Save'}
        </Button>
        <Button onClick={handleShare}>Share</Button>
        <Button onClick={() => setInfoTab('lyrics')}>Lyrics</Button>
        <Button onClick={() => setInfoTab('history')}>History</Button>
        <Button onClick={() => setInfoTab('theory')}>Theory</Button>
      </Controls>
    </PlayerContainer>
  );
};
