export type ThemeMode = 'light' | 'dark';

const palettes = {
  light: {
    surface: '#f4f4f0',
    border: '#b8b8b1',
    text: '#080808',
    mediaSurface: '#e8e8e3',
    fallbackText: '#333333',
    pill: '#cecec7',
    pillText: '#111111',
  },
  dark: {
    surface: '#050505',
    border: '#393939',
    text: '#f1f1ed',
    mediaSurface: '#161616',
    fallbackText: '#bdbdb8',
    pill: '#242424',
    pillText: '#e7e7e2',
  },
} as const;

export function getThemePalette(theme: ThemeMode) {
  return palettes[theme];
}
