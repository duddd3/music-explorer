import 'styled-components';

declare module 'styled-components' {
  export interface DefaultTheme {
    colors: {
      background: string;
      surface: string;
      accent: string;
      text: string;
      textSecondary: string;
      button: string;
      buttonActive: string;
      border: string;
    };
  }
}

export {};

