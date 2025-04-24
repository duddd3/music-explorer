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

const SavedSection = styled.div`
  padding: 1rem;
  border-bottom: 1px solid ${(props) => props.theme.border};
`;

const SectionTitle = styled.h2`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const SavedList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0;
`;

const SavedItem = styled.li`
  padding: 0.5rem;
  border-radius: 4px;
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.accent};
  }
`;

const EmptyMessage = styled.p`
  padding: 0.5rem;
  text-align: center;
`;

const FilterSection = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 1rem;
`;

interface SidebarProps {
  setCurrentSong: (song: any | null) => void;
  onFiltersChange: (filters: Filters) => void;
  savedSongs: any[];
}

interface Filters {
  search: string;
  decade: string[];
  genre: string[];
  subgenre: string[];
  language: string[];
}

interface FilterOptions {
  decades: string[];
  genres: string[];
  subgenres: Record<string, string[]>;
  countries: string[];
  languages: string[];
}

export const Sidebar: React.FC<SidebarProps> = ({ setCurrentSong, onFiltersChange, savedSongs }) => {
  const [search, setSearch] = useState('');
  const [filters, setFilters] = useState<Filters>({
    search: '',
    decade: [],
    genre: [],
    subgenre: [],
    language: [],
  });

  const [options, setOptions] = useState<FilterOptions>({
    decades: [],
    genres: [],
    subgenres: {},
    countries: [],
    languages: []
  });

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
        // setSavedSongs(data || []);
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
  const handleFilterChange = (filterType: keyof Filters, value: string) => {
    const newFilters = { ...filters };
    if (filterType === 'search') {
      newFilters.search = value;
    } else {
      const filterArray = newFilters[filterType] as string[];
      if (filterArray.includes(value)) {
        newFilters[filterType] = filterArray.filter(item => item !== value);
      } else {
        newFilters[filterType] = [...filterArray, value];
      }
    }
    setFilters(newFilters);
    onFiltersChange(newFilters);
  };

  const handleSearch = useCallback((value: string) => {
    setSearch(value);
    const newFilters = { ...filters, search: value };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [filters, onFiltersChange]);

  const resetFilters = useCallback(() => {
    const newFilters = {
      search: '',
      decade: [],
      genre: [],
      subgenre: [],
      mood: [],
      language: [],
    };
    setFilters(newFilters);
    onFiltersChange(newFilters);
  }, [onFiltersChange]);

  return (
    <SidebarContainer>
      <SavedSection>
        <SectionTitle>Saved Songs ({savedSongs.length})</SectionTitle>
        <SavedList>
          {savedSongs.map((song) => (
            <SavedItem key={song.id} onClick={() => setCurrentSong(song)}>
              {song.title}
            </SavedItem>
          ))}
          {savedSongs.length === 0 && (
            <EmptyMessage>No saved songs yet</EmptyMessage>
          )}
        </SavedList>
      </SavedSection>
      <FilterSection>
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
                  active={filters.decade.includes(decade)}
                  onClick={() => handleFilterChange('decade', decade)}
                >
                  {decade}s
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
                <MenuItem
                  key={genre}
                  active={filters.genre.includes(genre)}
                  onClick={() => handleFilterChange('genre', genre)}
                >
                  {genre}
                </MenuItem>
              ))}
            </MenuItems>
          </MenuSection>

          <MenuSection>
            <MenuTitle onClick={() => toggleSection('subgenre')}>
              Subgenre
              <span style={{ transform: `rotate(${openSections['subgenre'] ? 180 : 0}deg)`, transition: 'transform 0.3s ease' }}>▼</span>
            </MenuTitle>
            <MenuItems isOpen={openSections['subgenre']}>
              {Object.keys(options.subgenres).map(genre => (
                <MenuSection key={genre}>
                  <MenuTitle>{genre}</MenuTitle>
                  {options.subgenres[genre].map(subgenre => (
                    <MenuItem
                      key={subgenre}
                      active={filters.subgenre.includes(subgenre)}
                      onClick={() => handleFilterChange('subgenre', subgenre)}
                    >
                      {subgenre}
                    </MenuItem>
                  ))}
                </MenuSection>
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
                  active={filters.language.includes(language)}
                  onClick={() => handleFilterChange('language', language)}
                >
                  {language}
                </MenuItem>
              ))}
            </MenuItems>
          </MenuSection>
        </ScrollableSection>
      </FilterSection>
    </SidebarContainer>
  );
};
