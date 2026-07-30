import { create } from 'zustand';
import { createJSONStorage, persist } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '@/types';
import { dropLegacy, readLegacy } from './migrate';
import { isStationList, normalize, prepend } from './stationList';

const LEGACY_KEY = '@recent';
const STORAGE_KEY = 'recent-v1';
const MAX_ENTRIES = 10;

interface RecentStore {
  recent: Station[];
  push: (station: Station) => void;
  remove: (id: string) => void;
  clear: () => void;
}

export const useRecent = create<RecentStore>()(
  persist(
    (set, get) => ({
      recent: [],

      push: (station) => set({ recent: prepend(get().recent, station, MAX_ENTRIES) }),

      remove: (id) => set({ recent: get().recent.filter((s) => String(s.id) !== String(id)) }),

      clear: () => set({ recent: [] }),
    }),
    {
      name: STORAGE_KEY,
      version: 1,
      storage: createJSONStorage(() => AsyncStorage),
      partialize: (state) => ({ recent: state.recent }),

      onRehydrateStorage: () => async (state) => {
        if (!state || state.recent.length > 0) return;

        const legacy = await readLegacy(LEGACY_KEY, isStationList);
        if (legacy && legacy.length > 0) {
          useRecent.setState({ recent: legacy.map(normalize).slice(0, MAX_ENTRIES) });
        }
        await dropLegacy(LEGACY_KEY);
      },
    },
  ),
);
