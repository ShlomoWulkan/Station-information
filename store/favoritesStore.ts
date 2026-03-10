import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';
import type { Station } from '@/types';

const KEY = '@favorites';

interface FavoritesStore {
  favorites: Station[];
  load: () => Promise<void>;
  add: (s: Station) => Promise<void>;
  remove: (id: string) => Promise<void>;
  isFavorite: (id: string) => boolean;
}

export const useFavorites = create<FavoritesStore>((set, get) => ({
  favorites: [],

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set({ favorites: JSON.parse(raw) });
    } catch {}
  },

  add: async (station) => {
    const next = [station, ...get().favorites.filter(f => f.id !== station.id)];
    set({ favorites: next });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  },

  remove: async (id) => {
    const next = get().favorites.filter(f => f.id !== id);
    set({ favorites: next });
    await AsyncStorage.setItem(KEY, JSON.stringify(next));
  },

  isFavorite: (id) => get().favorites.some(f => f.id === id),
}));
