import { useColorScheme } from 'react-native';

import type { Specialty } from '../content/types';

/**
 * Design tokens. Warm paper background, white cards, one dark "hero" card,
 * pastel tones per specialty and a lime accent for progress.
 * Change colours here — screens only use tokens.
 */

type Tone = Specialty['tone'];

const tonesLight: Record<Tone, { bg: string; ink: string; strong: string }> = {
  lilac: { bg: '#E7E1FF', ink: '#3A2E85', strong: '#6C5CE7' },
  coral: { bg: '#FFDDD3', ink: '#8A2E17', strong: '#E5603F' },
  butter: { bg: '#FFEDBA', ink: '#6E4B00', strong: '#D99A00' },
  mint: { bg: '#D4F0DF', ink: '#1C5A38', strong: '#2F9E63' },
  sky: { bg: '#D7E9FF', ink: '#1B4A80', strong: '#3B82E0' },
  rose: { bg: '#FFDCE7', ink: '#8A1F48', strong: '#DB4C82' },
};

const tonesDark: Record<Tone, { bg: string; ink: string; strong: string }> = {
  lilac: { bg: '#2B2650', ink: '#D5CDFF', strong: '#9B8CFF' },
  coral: { bg: '#43231B', ink: '#FFC9B8', strong: '#FF8A68' },
  butter: { bg: '#3D3115', ink: '#FFE29A', strong: '#F2C14E' },
  mint: { bg: '#18382A', ink: '#B8EFCF', strong: '#5CCB8F' },
  sky: { bg: '#1A2D45', ink: '#C3DDFF', strong: '#6FA8FF' },
  rose: { bg: '#40192A', ink: '#FFC2D6', strong: '#FF7AA8' },
};

const light = {
  dark: false,
  bg: '#F4F1EA',
  surface: '#FFFFFF',
  surfaceAlt: '#EEEAE1',
  ink: '#17181C',
  inkSoft: '#55585F',
  inkFaint: '#8A8D94',
  line: '#E3DFD5',
  hero: '#17181C',
  heroInk: '#FFFFFF',
  heroSoft: '#A7AAB2',
  accent: '#C6F36B',
  accentInk: '#17181C',
  good: '#1F8A4C',
  goodBg: '#DDF3E4',
  warn: '#A86400',
  warnBg: '#FFF0D1',
  bad: '#C2362B',
  badBg: '#FDE3E0',
  bubbleMe: '#17181C',
  bubbleMeInk: '#FFFFFF',
  bubbleThem: '#FFFFFF',
  /** ECG paper: a pale pink grid, as on a real strip */
  ecg: { paper: '#FFF6F3', minor: '#F6DAD4', major: '#E9B2A8', trace: '#17181C' },
  /** Radiographs are the same in both themes: air is black, soft tissue grey, bone white */
  xray: { bg: '#050506', soft: '#4A4D53', softLight: '#62666D', bone: '#D8DADF', gas: '#0E0F11', fold: '#7D828A', label: '#C9CCD2' },
  tones: tonesLight,
};

const dark: typeof light = {
  dark: true,
  bg: '#0F1013',
  surface: '#1A1B20',
  surfaceAlt: '#24262C',
  ink: '#F2F2F4',
  inkSoft: '#B0B3BA',
  inkFaint: '#7C7F87',
  line: '#2D2F36',
  hero: '#26282F',
  heroInk: '#FFFFFF',
  heroSoft: '#A7AAB2',
  accent: '#C6F36B',
  accentInk: '#17181C',
  good: '#5CCB8F',
  goodBg: '#173427',
  warn: '#F2C14E',
  warnBg: '#3A2E12',
  bad: '#FF7A6B',
  badBg: '#41201C',
  bubbleMe: '#C6F36B',
  bubbleMeInk: '#17181C',
  bubbleThem: '#24262C',
  ecg: { paper: '#1F1B1C', minor: '#352B2A', major: '#56403C', trace: '#F2F2F4' },
  xray: { bg: '#050506', soft: '#4A4D53', softLight: '#62666D', bone: '#D8DADF', gas: '#0E0F11', fold: '#7D828A', label: '#C9CCD2' },
  tones: tonesDark,
};

export type Theme = typeof light;

export function useTheme(): Theme {
  return useColorScheme() === 'dark' ? dark : light;
}

export const radius = { sm: 12, md: 18, lg: 26, pill: 999 };
export const space = { xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 32 };
export const MAX_WIDTH = 720;

export const type = {
  display: { fontSize: 34, lineHeight: 40, fontWeight: '800' as const, letterSpacing: -0.8 },
  title: { fontSize: 24, lineHeight: 30, fontWeight: '800' as const, letterSpacing: -0.4 },
  heading: { fontSize: 18, fontWeight: '700' as const, letterSpacing: -0.2 },
  body: { fontSize: 15, fontWeight: '400' as const, lineHeight: 21 },
  bodyStrong: { fontSize: 15, fontWeight: '600' as const, lineHeight: 21 },
  small: { fontSize: 13, fontWeight: '500' as const, lineHeight: 18 },
  tiny: { fontSize: 11, fontWeight: '700' as const, letterSpacing: 0.6, textTransform: 'uppercase' as const },
  number: { fontSize: 28, fontWeight: '800' as const, letterSpacing: -0.6, fontVariant: ['tabular-nums' as const] },
};
