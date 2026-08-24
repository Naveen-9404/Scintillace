// src/constants/theme.js

export const theme = {
  colors: {
    primary: "#D4AF37", // Champagne Gold
    secondary: "#10B981", // Emerald
    accent: "#60A5FA",

    background: {
      primary: "#020617",
      secondary: "#0F172A",
      tertiary: "#111827",
    },

    text: {
      primary: "#FFFFFF",
      secondary: "#CBD5E1",
      muted: "#94A3B8",
    },

    border: {
      light: "rgba(255,255,255,0.08)",
      medium: "rgba(255,255,255,0.12)",
    },
  },

  radius: {
    sm: "8px",
    md: "14px",
    lg: "20px",
    xl: "28px",
    full: "9999px",
  },

  shadows: {
    glow: "0 0 35px rgba(212,175,55,.25)",
    card: "0 12px 35px rgba(0,0,0,.35)",
  },

  spacing: {
    section: "py-24 md:py-32",
    container: "max-w-7xl mx-auto px-6 lg:px-8",
  },

  animation: {
    duration: 0.4,
    stagger: 0.12,
  },
};

export default theme;