'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';

type Locale = 'en' | 'ar';

interface ProgressState {
  visitedLevels: number[];
  alphabetIndex: number;
  recognitionBest: number;
  tracingSessions: number;
  tracedLetters: string[];
}

interface UiContextValue {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  childName: string;
  setChildName: (name: string) => void;
  progress: ProgressState;
  markLevelVisited: (level: number) => void;
  saveAlphabetIndex: (index: number) => void;
  saveRecognitionScore: (score: number) => void;
  saveTracingLetter: (letterId: string) => void;
}

const DEFAULT_PROGRESS: ProgressState = {
  visitedLevels: [],
  alphabetIndex: 0,
  recognitionBest: 0,
  tracingSessions: 0,
  tracedLetters: [],
};

const SETTINGS_KEY = 'arabic-kids-settings';

const UiContext = createContext<UiContextValue | null>(null);

function progressKey(childName: string) {
  return `arabic-kids-progress:${(childName.trim() || 'guest').toLowerCase()}`;
}

export function UiProvider({ children }: { children: React.ReactNode }) {
  const [locale, setLocaleState] = useState<Locale>('en');
  const [childName, setChildNameState] = useState('Guest');
  const [progress, setProgress] = useState<ProgressState>(DEFAULT_PROGRESS);

  useEffect(() => {
    const rawSettings = window.localStorage.getItem(SETTINGS_KEY);
    if (!rawSettings) return;

    try {
      const parsed = JSON.parse(rawSettings) as Partial<{
        locale: Locale;
        childName: string;
      }>;
      if (parsed.locale === 'ar' || parsed.locale === 'en') {
        setLocaleState(parsed.locale);
      }
      if (parsed.childName) {
        setChildNameState(parsed.childName);
      }
    } catch {
      window.localStorage.removeItem(SETTINGS_KEY);
    }
  }, []);

  useEffect(() => {
    window.localStorage.setItem(
      SETTINGS_KEY,
      JSON.stringify({ locale, childName }),
    );
    document.documentElement.lang = locale === 'ar' ? 'ar' : 'en';
    document.documentElement.dir = locale === 'ar' ? 'rtl' : 'ltr';
  }, [locale, childName]);

  useEffect(() => {
    const stored = window.localStorage.getItem(progressKey(childName));
    if (!stored) {
      setProgress(DEFAULT_PROGRESS);
      return;
    }

    try {
      const parsed = JSON.parse(stored) as Partial<ProgressState>;
      setProgress({
        visitedLevels: parsed.visitedLevels ?? [],
        alphabetIndex: parsed.alphabetIndex ?? 0,
        recognitionBest: parsed.recognitionBest ?? 0,
        tracingSessions: parsed.tracingSessions ?? 0,
        tracedLetters: parsed.tracedLetters ?? [],
      });
    } catch {
      setProgress(DEFAULT_PROGRESS);
    }
  }, [childName]);

  const persistProgress = useCallback(
    (next: ProgressState) => {
      setProgress(next);
      window.localStorage.setItem(progressKey(childName), JSON.stringify(next));
    },
    [childName],
  );

  const setLocale = useCallback((nextLocale: Locale) => {
    setLocaleState(nextLocale);
  }, []);

  const setChildName = useCallback((name: string) => {
    const cleanName = name.trim();
    setChildNameState(cleanName || 'Guest');
  }, []);

  const markLevelVisited = useCallback(
    (level: number) => {
      const next = {
        ...progress,
        visitedLevels: progress.visitedLevels.includes(level)
          ? progress.visitedLevels
          : [...progress.visitedLevels, level].sort((a, b) => a - b),
      };
      persistProgress(next);
    },
    [persistProgress, progress],
  );

  const saveAlphabetIndex = useCallback(
    (index: number) => {
      if (index <= progress.alphabetIndex) return;
      persistProgress({ ...progress, alphabetIndex: index });
    },
    [persistProgress, progress],
  );

  const saveRecognitionScore = useCallback(
    (score: number) => {
      if (score <= progress.recognitionBest) return;
      persistProgress({ ...progress, recognitionBest: score });
    },
    [persistProgress, progress],
  );

  const saveTracingLetter = useCallback(
    (letterId: string) => {
      const nextLetters = progress.tracedLetters.includes(letterId)
        ? progress.tracedLetters
        : [...progress.tracedLetters, letterId];
      persistProgress({
        ...progress,
        tracingSessions: progress.tracingSessions + 1,
        tracedLetters: nextLetters,
      });
    },
    [persistProgress, progress],
  );

  const value = useMemo(
    () => ({
      locale,
      setLocale,
      childName,
      setChildName,
      progress,
      markLevelVisited,
      saveAlphabetIndex,
      saveRecognitionScore,
      saveTracingLetter,
    }),
    [
      childName,
      locale,
      markLevelVisited,
      progress,
      saveAlphabetIndex,
      saveRecognitionScore,
      saveTracingLetter,
      setChildName,
      setLocale,
    ],
  );

  return <UiContext.Provider value={value}>{children}</UiContext.Provider>;
}

export function useUi() {
  const context = useContext(UiContext);
  if (!context) {
    throw new Error('useUi must be used within UiProvider');
  }
  return context;
}
