import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '@/types';

const KEY = '@recent';
const MAX = 10;

interface RecentStore {
  recent: Station[];
  load: () => Promise<void>;
  push: (s: Station) => Promise<void>;
  remove: (id: string) => Promise<void>;
  clear: () => Promise<void>;
}

export const useRecent = create<RecentStore>((set, get) => ({
  recent: [],

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ recent: JSON.parse(raw) });
    } catch {}
  },

  push: async (station) => {
    const next = [station, ...get().recent.filter(r => r.id !== station.id)].slice(0, MAX);
    set({ recent: next });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  },

  remove: async (id) => {
    const next = get().recent.filter(r => r.id !== id);
    set({ recent: next });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  },

  clear: async () => {
    set({ recent: [] });
    await AsyncStorage.removeItem(KEY);
  },
}));
