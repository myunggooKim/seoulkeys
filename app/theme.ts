export type ThemeMode = "dark" | "light";

export const themeStorageKey = "seoulkeys-theme";

/**
 * The theme is already resolved and written to <html data-theme> by the blocking
 * script in app/layout.tsx, so read that instead of guessing again. Falling back
 * to a hard-coded "dark" here is what forced every first-time visitor into dark
 * regardless of their system preference.
 */
export function readResolvedTheme(): ThemeMode {
  if (typeof document === "undefined") return "dark";
  const applied = document.documentElement.getAttribute("data-theme");
  if (applied === "dark" || applied === "light") return applied;

  try {
    const saved = window.localStorage.getItem(themeStorageKey);
    if (saved === "dark" || saved === "light") return saved;
  } catch {
    // Private-mode storage denial: fall through to the system preference.
  }
  return window.matchMedia?.("(prefers-color-scheme: light)").matches ? "light" : "dark";
}

export function applyTheme(theme: ThemeMode) {
  document.documentElement.setAttribute("data-theme", theme);
  try {
    window.localStorage.setItem(themeStorageKey, theme);
  } catch {
    // Persisting is best-effort; the current page still switches.
  }
}
