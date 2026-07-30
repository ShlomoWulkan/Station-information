import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '@/types';
import { dropLegacy, readLegacy } from './migrate';
import { isStationList, normalize, prepend } from './stationList';

const LEGACY_KEY = '@favorites';
const STORAGE_KEY = 'favorites-v1';

interface FavoritesStore {
  favorites: Station[];
  add: (station: Station) => void;
  remove: (id: string) => void;
  isFavorite: (id: string) => boolean;
}

export const useFavorites = create<FavoritesStore>()(
  persist(
    (set, get) => ({
      favorites: [],

      // ה-persist middleware כותב לאחסון בעצמו. הגרסה הקודמת קראה ל-setItem
      // ידנית בלי try/catch, כך שכשל כתיבה היה unhandled rejection וה-state
      // בזיכרון והדיסק התפצלו בשקט.
      add: (station) => set({ favorites: prepend(get().favorites, station) }),

      remove: (id) =>
        set({ favorites: get().favorites.filter((s) => String(s.id) !== String(id)) }),

      isFavorite: (id) => get().favorites.some((s) => String(s.id) === String(id)),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ favorites: state.favorites }),

      onRehydrateStorage: () => async (state) => {
        // מי שכבר התקין שמר תחת '@favorites' כמערך גולמי. בלי הקריאה הזאת
        // הוא מאבד את המועדפים בשדרוג.
        if (!state || state.favorites.length > 0) return;

        const legacy = await readLegacy(LEGACY_KEY, isStationList);
        if (legacy && legacy.length > 0) {
          useFavorites.setState({ favorites: legacy.map(normalize) });
        }
        await dropLegacy(LEGACY_KEY);
      },
    },
  ),
);
