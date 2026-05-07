/** @type {import('tailwindcss').Config} */
module.exports = {
  important: true,
  darkMode: "class",
  content: [
    "./src/**/*.{html,ts}",
  ],
  theme: {
    extend: {
      colors: {
        "on-tertiary-fixed": "#2c1701",
        "on-surface": "#141e12",
        "surface-variant": "#dae6d2",
        "surface-container-lowest": "#ffffff",
        "primary-fixed-dim": "#00e639",
        "outline": "#6b7c65",
        "inverse-on-surface": "#e8f5e0",
        "error-container": "#ffdad6",
        "on-secondary-fixed": "#111c2d",
        "on-background": "#141e12",
        "on-secondary": "#ffffff",
        "surface-container": "#e5f2de",
        "on-secondary-container": "#586377",
        "surface-bright": "#f1fde9",
        "outline-variant": "#b9ccb2",
        "tertiary-fixed-dim": "#e7bf99",
        "on-primary-fixed-variant": "#00530e",
        "background": "#f1fde9",
        "surface-dim": "#d1deca",
        "primary": "#006e16",
        "primary-container": "#00ff41",
        "secondary-fixed": "#d8e3fb",
        "surface-container-high": "#dfecd8",
        "on-secondary-fixed-variant": "#3c475a",
        "inverse-surface": "#283326",
        "error": "#ba1a1a",
        "surface-container-low": "#ebf8e3",
        "secondary-fixed-dim": "#bcc7de",
        "on-tertiary-container": "#7a5b3c",
        "on-tertiary": "#ffffff",
        "secondary-container": "#d5e0f8",
        "surface-container-highest": "#dae6d2",
        "tertiary-fixed": "#ffdcbd",
        "on-tertiary-fixed-variant": "#5d4124",
        "on-surface-variant": "#3b4b37",
        "surface-tint": "#006e16",
        "tertiary": "#775839",
        "tertiary-container": "#ffd5ae",
        "on-error-container": "#93000a",
        "on-error": "#ffffff",
        "on-primary-container": "#007117",
        "inverse-primary": "#00e639",
        "primary-fixed": "#72ff70",
        "secondary": "#545f73",
        "on-primary": "#ffffff",
        "on-primary-fixed": "#002203",
        "surface": "#f1fde9"
      },
      borderRadius: {
        DEFAULT: "0.25rem",
        lg: "0.5rem",
        xl: "0.75rem",
        full: "9999px"
      },
      spacing: {
        gutter: "1px",
        sm: "12px",
        md: "16px",
        lg: "24px",
        base: "4px",
        xs: "8px",
        xl: "48px"
      },
      fontFamily: {
        "data-mono": ["Inter"],
        "body-base": ["Inter"],
        "label-caps": ["Space Grotesk"],
        "headline-md": ["Space Grotesk"],
        "display-lg": ["Space Grotesk"]
      },
      fontSize: {
        "data-mono": ["13px", { lineHeight: "1", fontWeight: "500" }],
        "body-base": ["14px", { lineHeight: "1.5", letterSpacing: "0em", fontWeight: "400" }],
        "label-caps": ["11px", { lineHeight: "1", letterSpacing: "0.1em", fontWeight: "600" }],
        "headline-md": ["24px", { lineHeight: "1.2", letterSpacing: "-0.01em", fontWeight: "600" }],
        "display-lg": ["48px", { lineHeight: "1.1", letterSpacing: "-0.02em", fontWeight: "700" }]
      }
    }
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/container-queries')
  ],
}
