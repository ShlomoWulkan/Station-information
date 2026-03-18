import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const KEY = '@accessibility';

export type TextScale = 1 | 1.2 | 1.5;

interface AccessibilityStore {
  textScale: TextScale;
  highContrast: boolean;
  reduceMotion: boolean;
  load: () => Promise<void>;
  setTextScale: (v: TextScale) => Promise<void>;
  toggleHighContrast: () => Promise<void>;
  toggleReduceMotion: () => Promise<void>;
  reset: () => Promise<void>;
}

const defaults = { textScale: 1 as TextScale, highContrast: false, reduceMotion: false };

export const useAccessibility = create<AccessibilityStore>((set, get) => ({
  ...defaults,

  load: async () => {
    try {
      const raw = await AsyncStorage.getItem(KEY);
      if (raw) set(JSON.parse(raw));
    } catch {}
  },

  setTextScale: async (textScale) => {
    set({ textScale });
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), textScale }));
  },

  toggleHighContrast: async () => {
    const highContrast = !get().highContrast;
    set({ highContrast });
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), highContrast }));
  },

  toggleReduceMotion: async () => {
    const reduceMotion = !get().reduceMotion;
    set({ reduceMotion });
    await AsyncStorage.setItem(KEY, JSON.stringify({ ...get(), reduceMotion }));
  },

  reset: async () => {
    set(defaults);
    await AsyncStorage.removeItem(KEY);
  },
}));
