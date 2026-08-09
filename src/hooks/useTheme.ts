import { useCallback, useEffect, useState } from 'react';

export type ThemePreference = 'light' | 'dark' | 'system';
export type VisualTheme = (typeof VISUAL_THEMES)[number]['id'];

const STORAGE_KEY = 'academic_os_theme';
const VISUAL_THEME_STORAGE_KEY = 'academic_os_visual_theme';

export const VISUAL_THEMES = [
  {
    id: 'academic',
    label: 'Akademik',
    description: 'E gjelbër klasike',
    swatches: ['#10b981', '#f59e0b'],
    mode: 'classic',
  },
  {
    id: 'ocean',
    label: 'Oqean',
    description: 'Blu e qetë dhe moderne',
    swatches: ['#13a7bd', '#38bdf8'],
    mode: 'dark',
  },
  {
    id: 'lavender',
    label: 'Lavandë',
    description: 'Vjollcë e butë krijuese',
    swatches: ['#8b5cf6', '#c084fc'],
    mode: 'dark',
  },
  {
    id: 'sunset',
    label: 'Perëndim',
    description: 'Portokalli i ngrohtë',
    swatches: ['#f97316', '#f43f5e'],
    mode: 'dark',
  },
  {
    id: 'midnight',
    label: 'Mesnatë',
    description: 'Kontrast i thellë nate',
    swatches: ['#22d3ee', '#818cf8'],
    mode: 'dark',
  },
  {
    id: 'paper',
    label: 'Light · Krem',
    description: 'E butë për lexim të gjatë',
    swatches: ['#c5852c', '#fff3d1'],
    mode: 'light',
  },
  {
    id: 'mint',
    label: 'Light · Mint',
    description: 'E freskët dhe e pastër',
    swatches: ['#2f9b7b', '#d8f7e9'],
    mode: 'light',
  },
  {
    id: 'rose',
    label: 'Light · Rozë',
    description: 'E ngrohtë dhe kreative',
    swatches: ['#f43f5e', '#ffe0eb'],
    mode: 'light',
  },
  {
    id: 'time',
    label: 'Sipas orës',
    description: 'Përshtatet automatikisht gjatë ditës',
    swatches: ['#f59e0b', '#0ea5e9'],
    mode: 'auto',
  },
] as const;

const VISUAL_THEME_IDS = new Set<string>(VISUAL_THEMES.map((theme) => theme.id));

function systemPrefersDark() {
  return window.matchMedia('(prefers-color-scheme: dark)').matches;
}

function timeBasedVisualTheme(): { id: Exclude<VisualTheme, 'time'>; isDark: boolean } {
  const hour = new Date().getHours();

  if (hour < 6 || hour >= 21) return { id: 'midnight', isDark: true };
  if (hour < 11) return { id: 'paper', isDark: false };
  if (hour < 17) return { id: 'ocean', isDark: false };
  return { id: 'sunset', isDark: false };
}

function applyTheme(preference: ThemePreference, visualTheme: VisualTheme) {
  const timeTheme = visualTheme === 'time' ? timeBasedVisualTheme() : null;
  const resolvedVisualTheme = timeTheme?.id ?? visualTheme;
  const visualThemeMode = VISUAL_THEMES.find((theme) => theme.id === visualTheme)?.mode;
  const isDark = timeTheme
    ? timeTheme.isDark
    : visualThemeMode === 'dark'
      ? true
      : visualThemeMode === 'light'
        ? false
    : preference === 'dark' || (preference === 'system' && systemPrefersDark());

  document.documentElement.classList.toggle('dark', isDark);
  document.documentElement.dataset.theme = resolvedVisualTheme;
  document.documentElement.dataset.visualTheme = visualTheme;
  document.documentElement.style.colorScheme = isDark ? 'dark' : 'light';
}

function readStoredTheme(): ThemePreference {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored === 'light' || stored === 'dark' || stored === 'system' ? stored : 'system';
}

function readStoredVisualTheme(): VisualTheme {
  const stored = localStorage.getItem(VISUAL_THEME_STORAGE_KEY);
  return stored && VISUAL_THEME_IDS.has(stored) ? (stored as VisualTheme) : 'academic';
}

export function useTheme() {
  const [theme, setThemeState] = useState<ThemePreference>(readStoredTheme);
  const [visualTheme, setVisualThemeState] = useState<VisualTheme>(readStoredVisualTheme);

  useEffect(() => {
    applyTheme(theme, visualTheme);
    const cleanups: Array<() => void> = [];

    if (theme === 'system') {
      const media = window.matchMedia('(prefers-color-scheme: dark)');
      const handleChange = () => applyTheme('system', visualTheme);
      media.addEventListener('change', handleChange);
      cleanups.push(() => media.removeEventListener('change', handleChange));
    }

    if (visualTheme === 'time') {
      const intervalId = window.setInterval(() => applyTheme(theme, visualTheme), 60_000);
      cleanups.push(() => window.clearInterval(intervalId));
    }

    return () => cleanups.forEach((cleanup) => cleanup());
  }, [theme, visualTheme]);

  const setTheme = useCallback((next: ThemePreference) => {
    localStorage.setItem(STORAGE_KEY, next);
    setThemeState(next);
  }, []);

  const cycleTheme = useCallback(() => {
    if (visualTheme === 'time') {
      localStorage.setItem(VISUAL_THEME_STORAGE_KEY, 'academic');
      setVisualThemeState('academic');
    }

    if (visualTheme !== 'academic' && visualTheme !== 'time') {
      localStorage.setItem(VISUAL_THEME_STORAGE_KEY, 'academic');
      setVisualThemeState('academic');
    }

    setTheme(theme === 'system' ? 'light' : theme === 'light' ? 'dark' : 'system');
  }, [theme, setTheme, visualTheme]);

  const setVisualTheme = useCallback((next: VisualTheme) => {
    localStorage.setItem(VISUAL_THEME_STORAGE_KEY, next);
    const nextMode = VISUAL_THEMES.find((visualThemeOption) => visualThemeOption.id === next)?.mode;

    if (nextMode === 'light') {
      localStorage.setItem(STORAGE_KEY, 'light');
      setThemeState('light');
    } else if (nextMode === 'dark') {
      localStorage.setItem(STORAGE_KEY, 'dark');
      setThemeState('dark');
    } else if (nextMode === 'auto') {
      localStorage.setItem(STORAGE_KEY, 'system');
      setThemeState('system');
    }

    setVisualThemeState(next);
  }, []);

  return { theme, setTheme, cycleTheme, visualTheme, setVisualTheme };
}
