import { create } from "zustand";
import { THEMES } from "../../constants";

export const useThemeStore = create((set) => ({
  theme: localStorage.getItem("chat-theme") || "coffee", // Default theme

  setTheme: (theme) => {
    // Validate the new theme against the list of available themes

    if (THEMES.includes(theme)) {
      localStorage.setItem("chat-theme", theme);
      set({ theme });
      // document.documentElement.setAttribute("data-theme", theme);
    } else {
      console.warn(`Theme "${theme}" is not valid.`);
    }
  },
}));
