import type { Config } from "tailwindcss"
import animate from "tailwindcss-animate";

const config: Config = {
  content: [
    "./pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./components/**/*.{js,ts,jsx,tsx,mdx}",
    "./app/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        // Base
        background: "var(--background)",
        foreground: "var(--foreground)",
        
        // Surface Colors
        surface: "var(--surface)",
        "surface-dim": "var(--surface-dim)",
        "surface-container": "var(--surface-container)",
        "surface-container-high": "var(--surface-container-high)",
        "surface-container-low": "var(--surface-container-low)",
        "surface-container-lowest": "var(--surface-container-lowest)",
        
        // Primary - Gold
        primary: "var(--primary)",
        "primary-foreground": "var(--primary-foreground)",
        "primary-container": "var(--primary-container)",
        "on-primary-container": "var(--on-primary-container)",
        "primary-fixed": "var(--primary-fixed)",
        "primary-fixed-dim": "var(--primary-fixed-dim)",
        "on-primary-fixed": "var(--on-primary-fixed)",
        "on-primary-fixed-variant": "var(--on-primary-fixed-variant)",
        
        // Secondary - Teal
        secondary: "var(--secondary)",
        "secondary-foreground": "var(--secondary-foreground)",
        "secondary-container": "var(--secondary-container)",
        "on-secondary-container": "var(--on-secondary-container)",
        
        // Tertiary - Silver
        tertiary: "var(--tertiary)",
        "tertiary-foreground": "var(--tertiary-foreground)",
        "tertiary-container": "var(--tertiary-container)",
        "on-tertiary-container": "var(--on-tertiary-container)",
        
        // Surface Text Colors
        "on-surface": "var(--on-surface)",
        "on-surface-variant": "var(--on-surface-variant)",
        "inverse-surface": "var(--inverse-surface)",
        "inverse-on-surface": "var(--inverse-on-surface)",
        "inverse-primary": "var(--inverse-primary)",
        
        // Outline
        outline: "var(--outline)",
        "outline-variant": "var(--outline-variant)",
        
        // Status
        error: "var(--error)",
        "on-error": "var(--on-error)",
        
        // Shadcn overrides
        card: "var(--card)",
        "card-foreground": "var(--card-foreground)",
        popover: "var(--popover)",
        "popover-foreground": "var(--popover-foreground)",
        muted: "var(--muted)",
        "muted-foreground": "var(--muted-foreground)",
        destructive: "var(--destructive)",
        "destructive-foreground": "var(--destructive-foreground)",
        border: "var(--border)",
        input: "var(--input)",
        ring: "var(--ring)",
      },
      fontFamily: {
        audiowide: ["var(--font-audiowide)", "cursive"],
        "display-hero": ["var(--font-audiowide)", "cursive"],
        "body-main": ["var(--font-tenor-sans)", "sans-serif"],
        "button-label": ["var(--font-button-label)", "sans-serif"],
        "section-header": ["var(--font-button-label)", "sans-serif"],
        spectral: ["var(--font-spectral)", "serif"],
        cinzel: ["var(--font-cinzel)", "serif"],
        playfair: ["var(--font-playfair)", "serif"],
      },
    },
  },
  plugins: [animate],
};
export default config;