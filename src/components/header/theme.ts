type Theme = "light" | "dark";

export function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

export function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" ? stored : null;
}

export function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

export function updateThemeIcon(
  theme: Theme,
  root: Document | Element = document,
): void {
  const button = root.querySelector
    ? root.querySelector("[data-theme-toggle]")
    : null;
  if (!button) return;

  const sunIcon = (button as Element).querySelector("[data-sun-icon]");
  const moonIcon = (button as Element).querySelector("[data-moon-icon]");

  if (theme === "dark") {
    sunIcon?.classList.remove("hidden");
    moonIcon?.classList.add("hidden");
  } else {
    sunIcon?.classList.add("hidden");
    moonIcon?.classList.remove("hidden");
  }
}

export function toggleTheme(root?: Document | Element): void {
  const current = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  const next: Theme = current === "dark" ? "light" : "dark";
  applyTheme(next);
  updateThemeIcon(next, root ?? document);
}

export function setupThemeToggle(root: Document | Element = document): boolean {
  const button = root.querySelector
    ? root.querySelector("[data-theme-toggle]")
    : null;
  if (!button) return false;

  const theme = getStoredTheme() ?? getSystemTheme();
  updateThemeIcon(theme, root);
  button.addEventListener("click", () => toggleTheme(root));
  return true;
}
