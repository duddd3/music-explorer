import React from 'react';
import styled from 'styled-components';

const InfoContainer = styled.div`
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text};
  border-radius: 8px;
  padding: 1.5rem;
  margin-top: 1rem;
  min-height: 180px;
  font-size: 1.1rem;
`;

export const InfoArea: React.FC<{ song: any, tab: 'lyrics' | 'history' | 'theory' }> = ({ song, tab }) => {
  // TODO: Fetch lyrics/history/theory online
  let content = 'No song selected.';
  if (song) {
    if (tab === 'lyrics') content = 'Lyrics will be shown here.';
    if (tab === 'history') content = 'Song history and meaning will be shown here.';
    if (tab === 'theory') content = 'Musical theory will be shown here.';
  }
  return <InfoContainer>{content}</InfoContainer>;
};
