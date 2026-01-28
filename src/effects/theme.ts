type Theme = "light" | "dark";

function getSystemTheme(): Theme {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light";
}

function getStoredTheme(): Theme | null {
  const stored = localStorage.getItem("theme");
  return stored === "light" || stored === "dark" ? stored : null;
}

function applyTheme(theme: Theme): void {
  if (theme === "dark") {
    document.documentElement.classList.add("dark");
  } else {
    document.documentElement.classList.remove("dark");
  }
  localStorage.setItem("theme", theme);
}

function toggleTheme(): void {
  const current = document.documentElement.classList.contains("dark")
    ? "dark"
    : "light";
  const next = current === "dark" ? "light" : "dark";
  applyTheme(next);
  updateThemeIcon(next);
}

function updateThemeIcon(theme: Theme): void {
  const button = document.querySelector("[data-theme-toggle]");
  if (!button) return;

  const sunIcon = button.querySelector("[data-sun-icon]");
  const moonIcon = button.querySelector("[data-moon-icon]");

  if (theme === "dark") {
    sunIcon?.classList.remove("hidden");
    moonIcon?.classList.add("hidden");
  } else {
    sunIcon?.classList.add("hidden");
    moonIcon?.classList.remove("hidden");
  }
}

function initTheme(): void {
  const theme = getStoredTheme() ?? getSystemTheme();
  applyTheme(theme);
  updateThemeIcon(theme);

  const button = document.querySelector("[data-theme-toggle]");
  button?.addEventListener("click", toggleTheme);

  window
    .matchMedia("(prefers-color-scheme: dark)")
    .addEventListener("change", (e) => {
      if (!getStoredTheme()) {
        const theme = e.matches ? "dark" : "light";
        applyTheme(theme);
        updateThemeIcon(theme);
      }
    });
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initTheme);
} else {
  initTheme();
}
