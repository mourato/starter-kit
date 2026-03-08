/**
 * Theme store — Zustand.
 *
 * Example Zustand store with selector-based re-renders.
 *
 * @module ThemeStore
 */
import { create } from "zustand";

interface ThemeState {
    sidebarOpen: boolean;
    toggleSidebar: () => void;
}

export const useThemeStore = create<ThemeState>((set) => ({
    sidebarOpen: true,
    toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
}));
