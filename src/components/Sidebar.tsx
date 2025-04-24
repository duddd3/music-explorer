import React, { useState } from 'react';
import styled from 'styled-components';

const SidebarContainer = styled.aside`
  width: 300px;
  background: ${(props) => props.theme.colors.background};
  border-right: 1px solid ${(props) => props.theme.colors.border};
  padding: 1.5rem 1rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  @media (max-width: 600px) {
    width: 100vw;
    position: fixed;
    z-index: 100;
    height: auto;
    border-right: none;
    border-bottom: 1px solid ${(props) => props.theme.colors.border};
  }
`;

const SearchInput = styled.input`
  padding: 0.5rem 1rem;
  border-radius: 6px;
  border: none;
  background: ${(props) => props.theme.colors.surface};
  color: ${(props) => props.theme.colors.text};
  font-size: 1rem;
`;

const MenuSection = styled.div`
  margin-bottom: 1rem;
`;

const MenuTitle = styled.div`
  font-weight: bold;
  margin-bottom: 0.5rem;
`;

const MenuItem = styled.div`
  padding: 0.3rem 0.7rem;
  border-radius: 4px;
  cursor: pointer;
  color: ${(props) => props.theme.colors.textSecondary};
  &:hover {
    background: ${(props) => props.theme.colors.accent};
    color: ${(props) => props.theme.colors.text};
  }
`;

const ResetButton = styled.button`
  background: ${(props) => props.theme.colors.button};
  color: ${(props) => props.theme.colors.text};
  border: none;
  border-radius: 6px;
  padding: 0.5rem 1rem;
  margin-top: 2rem;
  cursor: pointer;
  &:hover {
    background: ${(props) => props.theme.colors.buttonActive};
  }
`;

export const Sidebar: React.FC<{ setCurrentSong: (song: any) => void }> = ({ setCurrentSong }) => {
  // Placeholder filter state
  const [search, setSearch] = useState('');

  // TODO: Fetch filter options from Supabase
  // TODO: List matching songs in text area on filter/search

  return (
    <SidebarContainer>
      <SearchInput
        placeholder="Search songs, artists..."
        value={search}
        onChange={e => setSearch(e.target.value)}
      />
      <MenuSection>
        <MenuTitle>Decade</MenuTitle>
        {/* TODO: Expandable years */}
        <MenuItem>1980s</MenuItem>
        <MenuItem>1990s</MenuItem>
      </MenuSection>
      <MenuSection>
        <MenuTitle>Genre</MenuTitle>
        {/* TODO: Expandable subgenres */}
        <MenuItem>Rock</MenuItem>
        <MenuItem>Pop</MenuItem>
      </MenuSection>
      <MenuSection>
        <MenuTitle>Country</MenuTitle>
        <MenuItem>USA</MenuItem>
        <MenuItem>UK</MenuItem>
      </MenuSection>
      <MenuSection>
        <MenuTitle>Language</MenuTitle>
        <MenuItem>English</MenuItem>
        <MenuItem>Instrumental</MenuItem>
      </MenuSection>
      <MenuSection>
        <MenuTitle>Saved</MenuTitle>
        {/* TODO: List saved songs */}
        <MenuItem>No saved songs</MenuItem>
      </MenuSection>
      <ResetButton>Reset Filters</ResetButton>
    </SidebarContainer>
  );
};
