import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { dropLegacy, readLegacy } from './migrate';

const LEGACY_KEY = '@accessibility';
const STORAGE_KEY = 'accessibility-v1';

export type TextScale = 1 | 1.2 | 1.5;

const TEXT_SCALES: readonly TextScale[] = [1, 1.2, 1.5];

interface Settings {
  textScale: TextScale;
  highContrast: boolean;
  reduceMotion: boolean;
}

interface AccessibilityStore extends Settings {
  setTextScale: (value: TextScale) => void;
  toggleHighContrast: () => void;
  toggleReduceMotion: () => void;
  reset: () => void;
}

const DEFAULTS: Settings = { textScale: 1, highContrast: false, reduceMotion: false };

/**
 * מאמת הגדרות שנקראו מאחסון.
 *
 * הגרסה הקודמת עשתה set(JSON.parse(raw)) ישירות. blob פגום או מגרסה ישנה יכול
 * היה להזריק textScale לא חוקי, ואז font() מחזירה NaN וכל טקסט באפליקציה נעלם.
 */
function isSettings(value: unknown): value is Settings {
  if (typeof value !== 'object' || value === null) return false;
  const v = value as Record<string, unknown>;
  return (
    TEXT_SCALES.includes(v.textScale as TextScale) &&
    typeof v.highContrast === 'boolean' &&
    typeof v.reduceMotion === 'boolean'
  );
}

export const useAccessibility = create<AccessibilityStore>()(
  persist(
    (set, get) => ({
      ...DEFAULTS,

      setTextScale: (textScale) => set({ textScale }),
      toggleHighContrast: () => set({ highContrast: !get().highContrast }),
      toggleReduceMotion: () => set({ reduceMotion: !get().reduceMotion }),
      reset: () => set(DEFAULTS),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: ({ textScale, highContrast, reduceMotion }) => ({
        textScale,
        highContrast,
        reduceMotion,
      }),

      // נופל להגדרות ברירת המחדל במקום לקבל מצב לא תקין.
      merge: (persisted, current) =>
        isSettings(persisted) ? { ...current, ...persisted } : current,

      onRehydrateStorage: () => async (state) => {
        if (!state) return;

        const legacy = await readLegacy(LEGACY_KEY, isSettings);
        if (legacy) useAccessibility.setState(legacy);
        await dropLegacy(LEGACY_KEY);
      },
    },
  ),
);
