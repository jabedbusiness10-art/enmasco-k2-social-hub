import { create } from "zustand";

type AppState = {
  isDarkMode: boolean;
  toggleTheme: () => void;
};

export const useAppStore = create<AppState>((set) => ({
  isDarkMode: true,
  toggleTheme: () => set((state) => ({ isDarkMode: !state.isDarkMode })),
}));
