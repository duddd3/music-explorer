import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    background: string;
    surface: string;
    primary: string;
    accent: string;
    border: string;
    text: string;
    textSecondary: string;
    button: string;
    buttonActive: string;
  }
}
