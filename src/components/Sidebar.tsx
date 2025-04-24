import React, { useState, useEffect, useCallback } from 'react';
import styled from 'styled-components';
import { supabase } from '../supabaseClient';

const SidebarContainer = styled.aside`
  width: 300px;
  background: ${props => props.theme.background};
  border-right: 1px solid ${props => props.theme.border};
  display: flex;
  flex-direction: column;
  height: 100vh;
  @media (max-width: 600px) {
    width: 100vw;
    position: fixed;
    z-index: 100;
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${props => props.theme.border};
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: ${props => props.theme.button};
  color: ${props => props.theme.text};
  font-size: 1rem;
`;

const TopSection = styled.div`
  padding: 1.5rem 1rem;
  border-bottom: 1px solid ${(props) => props.theme.border};
`;

const MenuSection = styled.div`
  overflow: hidden;
  margin-bottom: 0.5rem;
`;

const MenuTitle = styled.div`
  font-weight: bold;
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.8rem;
  border-radius: 4px;
  background: ${(props) => props.theme.surface};
  margin-bottom: 0.5rem;
  &:hover {
    background: ${(props) => props.theme.accent};
    color: ${(props) => props.theme.text};
  }
`;

const ScrollableSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
  &::-webkit-scrollbar {
    width: 8px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: ${props => props.theme.border};
    border-radius: 4px;
  }
`;

const MenuItems = styled.div<{ isOpen: boolean }>`
  max-height: ${props => props.isOpen ? '300px' : '0'};
  overflow-y: auto;
  transition: max-height 0.3s ease-in-out;
  margin-left: 0.5rem;
`;

const MenuItem = styled.div<{ active?: boolean }>`
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => props.active ? props.theme.text : props.theme.textSecondary};
  background: ${(props) => props.active ? props.theme.accent : 'transparent'};
  &:hover {
    background: ${(props) => props.theme.accent};
    color: ${(props) => props.theme.text};
  }
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 0.2rem;
`;

const ResetButton = styled.button`
  background: ${(props) => props.theme.button};
  color: ${(props) => props.theme.text};
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 0.5rem;
  width: 100%;
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.buttonActive};
  }
`;

interface SidebarProps {
  setCurrentSong: (song: any) => void;
  onFiltersChange: (filters: Filters) => void;
}

interface Filters {
  search: string;
  decade: string | null;
  genre: string | null;
  subgenre: string | null;
  country: string | null;
  language: string | null;
}

interface FilterOptions {
  decades: string[];
  genres: string[];
  subgenres: Record<string, string[]>;
  countries: string[];
  languages: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ setCurrentSong, onFiltersChange }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    decade: null,
    genre: null,
    subgenre: null,
    country: null,
    language: null
  });
  
  const [options, setOptions] = useState<FilterOptions>({
    decades: [],
    genres: [],
    subgenres: {},
    countries: [],
    languages: []
  });

  const [savedSongs, setSavedSongs] = useState<any[]>([]);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const toggleSection = useCallback((section: string) => {
    setOpenSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  }, []);

  // Load saved songs from localStorage
  useEffect(() => {
    const savedIds = JSON.parse(localStorage.getItem('savedSongs') || '[]');
    if (savedIds.length > 0) {
      const fetchSavedSongs = async () => {
        const { data } = await supabase
          .from('songs')
          .select('*')
          .in('id', savedIds);
        setSavedSongs(data || []);
      };
      fetchSavedSongs();
    }
  }, []);

  // Fetch filter options
  useEffect(() => {
    const fetchOptions = async () => {
      const { data: songs } = await supabase
        .from('songs')
        .select('year, genre, subgenre, country, language');

      if (songs) {
        const decades = Array.from(new Set(songs.map(s => `${Math.floor(s.year / 10) * 10}s`)));
        const genres = Array.from(new Set(songs.map(s => s.genre)));
        const countries = Array.from(new Set(songs.map(s => s.country)));
        const languages = Array.from(new Set(songs.map(s => s.language)));
        
        // Group subgenres by genre
        const subgenres: Record<string, string[]> = {};
        songs.forEach(song => {
          if (!subgenres[song.genre]) {
            subgenres[song.genre] = [];
          }
          if (song.subgenre && !subgenres[song.genre].includes(song.subgenre)) {
            subgenres[song.genre].push(song.subgenre);
          }
        });

        setOptions({
          decades: decades.sort(),
          genres: genres.sort(),
          subgenres,
          countries: countries.sort(),
          languages: languages.sort()
        });
      }
    };
    fetchOptions();
  }, []);

  // Update filters and notify parent
  const updateFilters = useCallback((key: keyof Filters, value: string | null) => {
    const newFilters = { ...filters, [key]: value };
    if (key === 'genre' && value === null) {
      newFilters.subgenre = null;
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    updateFilters('search', value || null);
  }, [updateFilters]);

  const resetFilters = useCallback(() => {
    setSearch('');
    setFilters({
      search: '',
      decade: null,
      genre: null,
      subgenre: null,
      country: null,
      language: null
    });
    onFiltersChange({
      search: '',
      decade: null,
      genre: null,
      subgenre: null,
      country: null,
      language: null
    });
  }, [onFiltersChange]);

  return (
    <SidebarContainer>
      <TopSection>
        <SearchInput
          type="text"
          placeholder="Search..."
          value={search}
          onChange={e => handleSearch(e.target.value)}
        />
        <ResetButton onClick={resetFilters}>Reset Filters</ResetButton>
      </TopSection>
      <ScrollableSection>
        <MenuSection>
          <MenuTitle onClick={() => toggleSection('decade')}>
            Decade
            <span style={{ transform: `rotate(${openSections['decade'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
          </MenuTitle>
          <MenuItems isOpen={openSections['decade']}>
            {options.decades.map(decade => (
              <MenuItem 
                key={decade}
                active={filters.decade === decade}
                onClick={() => updateFilters('decade', filters.decade === decade ? null : decade)}
              >
                {decade}
              </MenuItem>
            ))}
          </MenuItems>
        </MenuSection>
        <MenuSection>
          <MenuTitle onClick={() => toggleSection('genre')}>
            Genre
            <span style={{ transform: `rotate(${openSections['genre'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
          </MenuTitle>
          <MenuItems isOpen={openSections['genre']}>
            {options.genres.map(genre => (
              <React.Fragment key={genre}>
                <MenuItem 
                  active={filters.genre === genre}
                  onClick={() => updateFilters('genre', filters.genre === genre ? null : genre)}
                >
                  {genre}
                </MenuItem>
                {filters.genre === genre && options.subgenres[genre]?.map(subgenre => (
                  <MenuItem 
                    key={subgenre}
                    active={filters.subgenre === subgenre}
                    onClick={() => updateFilters('subgenre', filters.subgenre === subgenre ? null : subgenre)}
                    style={{ marginLeft: '1rem' }}
                  >
                    {subgenre}
                  </MenuItem>
                ))}
              </React.Fragment>
            ))}
          </MenuItems>
        </MenuSection>
        <MenuSection>
          <MenuTitle onClick={() => toggleSection('country')}>
            Country
            <span style={{ transform: `rotate(${openSections['country'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
          </MenuTitle>
          <MenuItems isOpen={openSections['country']}>
            {options.countries.map(country => (
              <MenuItem 
                key={country}
                active={filters.country === country}
                onClick={() => updateFilters('country', filters.country === country ? null : country)}
              >
                {country}
              </MenuItem>
            ))}
          </MenuItems>
        </MenuSection>
        <MenuSection>
          <MenuTitle onClick={() => toggleSection('language')}>
            Language
            <span style={{ transform: `rotate(${openSections['language'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
          </MenuTitle>
          <MenuItems isOpen={openSections['language']}>
            {options.languages.map(language => (
              <MenuItem 
                key={language}
                active={filters.language === language}
                onClick={() => updateFilters('language', filters.language === language ? null : language)}
              >
                {language}
              </MenuItem>
            ))}
          </MenuItems>
        </MenuSection>
        <MenuSection>
          <MenuTitle onClick={() => toggleSection('saved')}>
            Saved Songs
            <span style={{ transform: `rotate(${openSections['saved'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
          </MenuTitle>
          <MenuItems isOpen={openSections['saved']}>
            {savedSongs.length > 0 ? (
              savedSongs.map(song => (
                <MenuItem 
                  key={song.id}
                  onClick={() => setCurrentSong(song)}
                >
                  {song.title}
                  <span style={{ fontSize: '0.8em' }}>{song.artist}</span>
                </MenuItem>
              ))
            ) : (
              <MenuItem>No saved songs</MenuItem>
            )}
          </MenuItems>
        </MenuSection>
      </ScrollableSection>
    </SidebarContainer>
  );
};
