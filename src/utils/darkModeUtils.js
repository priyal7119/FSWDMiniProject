// Dark Mode Utility
// Manages dark mode theme switching and persistence

export class DarkModeUtils {
  static STORAGE_KEY = "mapout-dark-mode";
  static CLASS_NAME = "dark-mode";
  static MEDIA_QUERY = "(prefers-color-scheme: dark)";

  // Initialize dark mode on app load
  static initialize() {
    const savedPreference = this.getSavedPreference();
    const systemPreference = this.getSystemPreference();
    const isDarkMode = savedPreference !== null ? savedPreference : systemPreference;

    if (isDarkMode) {
      this.enable();
    } else {
      this.disable();
    }

    // Listen for system preference changes
    this.watchSystemPreference();
  }

  // Enable dark mode
  static enable() {
    document.documentElement.classList.add(this.CLASS_NAME);
    localStorage.setItem(this.STORAGE_KEY, "true");
    this.updateColors(true);
  }

  // Disable dark mode
  static disable() {
    document.documentElement.classList.remove(this.CLASS_NAME);
    localStorage.setItem(this.STORAGE_KEY, "false");
    this.updateColors(false);
  }

  // Toggle dark mode
  static toggle() {
    const isDarkMode = this.isDarkMode();
    if (isDarkMode) {
      this.disable();
    } else {
      this.enable();
    }
    return !isDarkMode;
  }

  // Check if dark mode is enabled
  static isDarkMode() {
    return document.documentElement.classList.contains(this.CLASS_NAME);
  }

  // Get saved preference from localStorage
  static getSavedPreference() {
    const saved = localStorage.getItem(this.STORAGE_KEY);
    return saved !== null ? saved === "true" : null;
  }

  // Get system preference
  static getSystemPreference() {
    return window.matchMedia(this.MEDIA_QUERY).matches;
  }

  // Watch for system preference changes
  static watchSystemPreference() {
    const mediaQuery = window.matchMedia(this.MEDIA_QUERY);
    const handleChange = (e) => {
      const savedPreference = this.getSavedPreference();
      // Only auto-switch if user hasn't saved a preference
      if (savedPreference === null) {
        e.matches ? this.enable() : this.disable();
      }
    };

    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener("change", handleChange);
    } else if (mediaQuery.addListener) {
      // Older browsers
      mediaQuery.addListener(handleChange);
    }
  }

  // Update CSS colors based on mode
  static updateColors(isDark) {
    const root = document.documentElement;
    if (isDark) {
      root.style.setProperty("--mapout-bg", "#1a1a1a");
      root.style.setProperty("--mapout-surface", "#2d2d2d");
      root.style.setProperty("--mapout-text", "#e0e0e0");
      root.style.setProperty("--mapout-text-secondary", "#a0a0a0");
      root.style.setProperty("--mapout-border", "#404040");
    } else {
      root.style.setProperty("--mapout-bg", "#ffffff");
      root.style.setProperty("--mapout-surface", "#f8f9fa");
      root.style.setProperty("--mapout-text", "#1a1a1a");
      root.style.setProperty("--mapout-text-secondary", "#666666");
      root.style.setProperty("--mapout-border", "#e0e0e0");
    }
  }

  // Get contrasting text color for dark mode
  static getTextColor(isDark = this.isDarkMode()) {
    return isDark ? "#e0e0e0" : "#1a1a1a";
  }

  // Get background color for current mode
  static getBackgroundColor(isDark = this.isDarkMode()) {
    return isDark ? "#1a1a1a" : "#ffffff";
  }

  // Get surface color for current mode
  static getSurfaceColor(isDark = this.isDarkMode()) {
    return isDark ? "#2d2d2d" : "#f8f9fa";
  }

  // Get border color for current mode
  static getBorderColor(isDark = this.isDarkMode()) {
    return isDark ? "#404040" : "#e0e0e0";
  }

  // CSS variable names for dark mode
  static getCSSVariables(isDark = this.isDarkMode()) {
    return {
      bg: isDark ? "#1a1a1a" : "#ffffff",
      surface: isDark ? "#2d2d2d" : "#f8f9fa",
      text: isDark ? "#e0e0e0" : "#1a1a1a",
      textSecondary: isDark ? "#a0a0a0" : "#666666",
      border: isDark ? "#404040" : "#e0e0e0",
      primary: "var(--mapout-primary)",
      secondary: "var(--mapout-secondary)",
      accent: "var(--mapout-accent)",
    };
  }

  // Get Tailwind dark class
  static getTailwindDarkClass() {
    return this.isDarkMode() ? "dark" : "";
  }
}

// React Hook for dark mode
export function useDarkMode() {
  const [isDark, setIsDark] = React.useState(() => {
    return DarkModeUtils.isDarkMode();
  });

  const toggle = () => {
    const newState = DarkModeUtils.toggle();
    setIsDark(newState);
  };

  React.useEffect(() => {
    DarkModeUtils.initialize();
  }, []);

  return {
    isDark,
    toggle,
    enable: () => {
      DarkModeUtils.enable();
      setIsDark(true);
    },
    disable: () => {
      DarkModeUtils.disable();
      setIsDark(false);
    },
  };
}

export default DarkModeUtils;
