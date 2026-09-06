export type ThemeMode = 'light' | 'dark';

const palettes = {
  light: {
    surface: '#ffffff',
    border: '#bdbdbd',
    text: '#080808',
    mediaSurface: '#f2f2f2',
    fallbackText: '#333333',
    pill: '#d8d8d8',
    pillText: '#111111',
    hoverOverlay: 'rgba(255, 255, 255, 0.68)',
    hoverBorder: '#bdbdbd',
  },
  dark: {
    surface: '#050505',
    border: '#393939',
    text: '#f1f1ed',
    mediaSurface: '#161616',
    fallbackText: '#bdbdb8',
    pill: '#242424',
    pillText: '#e7e7e2',
    hoverOverlay: 'rgba(5, 5, 5, 0.58)',
    hoverBorder: '#f1f1ed',
  },
} as const;

export function getThemePalette(theme: ThemeMode) {
  return palettes[theme];
}
