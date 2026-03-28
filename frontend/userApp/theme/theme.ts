// theme/theme.ts
import { create } from "zustand";
import AsyncStorage from "@react-native-async-storage/async-storage";

const THEME_COLORS = [
  "rgba(251, 191, 36, 1)",
  "rgba(56, 189, 248, 1)",
  "rgba(16, 185, 129, 1)",
  "rgba(248, 113, 113, 1)",
  "rgba(168, 85, 247, 1)",
  "rgba(253, 126, 20, 1)",
  "rgba(244, 114, 182, 1)",
  "rgba(45, 212, 191, 1)",
  "rgba(59, 130, 246, 1)",
  "rgba(100, 116, 139, 1)",
];

type ThemeStore = {
  primary: string;
  isDark: boolean;
  setPrimary: (color: string) => void;
  toggleDarkMode: () => void;
  themes: string[];
};

export const useTheme = create<ThemeStore>((set) => ({
  primary: THEME_COLORS[0],
  isDark: true, // default dark
  themes: THEME_COLORS,
  setPrimary: async (color) => {
    set({ primary: color });
    await AsyncStorage.setItem("appPrimaryColor", color);
  },
  toggleDarkMode: async () => {
    set((state) => {
      const newDark = !state.isDark;
      AsyncStorage.setItem("appDarkMode", newDark ? "dark" : "light");
      return { isDark: newDark };
    });
  },
}));

// Load from storage
export const loadTheme = async () => {
  const [savedColor, savedMode] = await Promise.all([
    AsyncStorage.getItem("appPrimaryColor"),
    AsyncStorage.getItem("appDarkMode"),
  ]);

  if (savedColor && THEME_COLORS.includes(savedColor)) {
    useTheme.getState().setPrimary(savedColor);
  }

  if (savedMode === "light") {
    useTheme.getState().toggleDarkMode();
  }
};

// Dynamic background
export const colors = {
  get primary() {
    return useTheme.getState().primary;
  },
  get background() {
    return useTheme.getState().isDark ? "#000000" : "#FFFFFF";
  },
  get text() {
    return useTheme.getState().isDark ? "#FFFFFF" : "#000000";
  },
};