import { DefaultTheme } from 'styled-components';

const colors = {
  background: '#1a1a2e',
  surface: '#16213e',
  accent: '#0f3460',
  text: '#e94560',
  textSecondary: '#b0b0b0',
  button: '#0f3460',
  buttonActive: '#e94560',
  border: '#533483'
};

export const theme: DefaultTheme = {
  colors,
  ...colors
};
