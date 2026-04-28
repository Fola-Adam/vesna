---
name: Obsidian & Gold Editorial
colors:
  surface: '#131313'
  surface-dim: '#131313'
  surface-bright: '#3a3939'
  surface-container-lowest: '#0e0e0e'
  surface-container-low: '#1c1b1b'
  surface-container: '#201f1f'
  surface-container-high: '#2a2a2a'
  surface-container-highest: '#353534'
  on-surface: '#e5e2e1'
  on-surface-variant: '#d0c5af'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907c'
  outline-variant: '#4d4635'
  surface-tint: '#e9c349'
  primary: '#f2ca50'
  on-primary: '#3c2f00'
  primary-container: '#d4af37'
  on-primary-container: '#554300'
  inverse-primary: '#735c00'
  secondary: '#abcdcd'
  on-secondary: '#143535'
  secondary-container: '#2e4e4e'
  on-secondary-container: '#9dbfbe'
  tertiary: '#cecece'
  on-tertiary: '#2f3131'
  tertiary-container: '#b2b3b3'
  on-tertiary-container: '#444546'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe088'
  primary-fixed-dim: '#e9c349'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#574500'
  secondary-fixed: '#c6e9e9'
  secondary-fixed-dim: '#abcdcd'
  on-secondary-fixed: '#002020'
  on-secondary-fixed-variant: '#2c4c4c'
  tertiary-fixed: '#e2e2e2'
  tertiary-fixed-dim: '#c6c6c7'
  on-tertiary-fixed: '#1a1c1c'
  on-tertiary-fixed-variant: '#454747'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-lg:
    fontFamily: Cormorant Garamond
    fontSize: 84px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  headline-md:
    fontFamily: Cormorant Garamond
    fontSize: 48px
    fontWeight: '400'
    lineHeight: '1.2'
  label-caps:
    fontFamily: Tenor Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.15em
  body-main:
    fontFamily: DM Sans
    fontSize: 16px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  body-sm:
    fontFamily: DM Sans
    fontSize: 14px
    fontWeight: '300'
    lineHeight: '1.5'
spacing:
  unit: 4px
  gutter: 24px
  margin: 64px
  section-gap: 128px
---

## Brand & Style

The design system is rooted in the "Luxury Fashion Editorial" aesthetic, prioritizing negative space, high-contrast values, and a cinematic atmosphere. The brand personality is prestigious, mysterious, and intentional. It draws heavily from **Minimalism** and **Glassmorphism**, using extreme dark backgrounds to make content appear as if it is emerging from the shadows.

The UI should evoke a sense of "digital silk"—smooth transitions, thin lines, and a rhythmic flow that mirrors the experience of leafing through a high-end physical magazine. Every element is designed to feel curated rather than functional, emphasizing form and typographic grace.

## Colors

This design system utilizes a deep, "Obsidian" base to create an immersive canvas. 

- **Obsidian (#0A0A0A):** The foundation. All primary surfaces use this pitch-black value to eliminate visual noise.
- **Gold Accent (#D4AF37):** Used sparingly for high-value interactions, active states, and call-to-action iconography.
- **Forest Green (#2F4F4F):** A secondary accent used for subtle depth, hover states on dark surfaces, or to denote specialized collections.
- **Off-White (#F5F5F5):** Reserved for primary text and high-contrast borders to ensure legibility against the obsidian background without the harshness of pure white.

## Typography

The "Pair B" typography scheme is the cornerstone of the editorial vibe.

- **Headings:** Cormorant Garamond in 400 Italic provides a romantic, serif-heavy flourish. Use large scales for display text to emphasize the stroke contrast.
- **Navigation & Labels:** Tenor Sans is used exclusively in uppercase with generous letter spacing (tracking). This creates a structured, architectural feel for UI controls and metadata.
- **Body Text:** DM Sans at 300 weight ensures modern, lightweight legibility. The low weight maintains the "airy" luxury feel while ensuring long-form content is readable.

## Layout & Spacing

The design system employs a **Fixed Grid** model for desktop and a fluid model for mobile. On desktop, content is centered within a 12-column grid with wide margins (64px+) to prevent the eye from reaching the edges of the screen, mimicking a magazine's "safe zone."

Spacing is aggressive; vertical gaps between sections should be large (128px) to allow the typography to breathe. Use a 4px baseline grid to ensure all labels and body text align vertically across columns.

## Elevation & Depth

Depth is achieved through **Glassmorphism** and **Tonal Layers** rather than traditional shadows. 

- **Surfaces:** Use semi-transparent overlays of the Forest Green (#2F4F4F) at 10-15% opacity over the Obsidian background to create "elevated" cards.
- **Backdrop Blur:** Floating menus or navigation bars must use a 20px backdrop blur to create a frosted glass effect that maintains the editorial mood.
- **Dividers:** Use ultra-thin (0.5pt) borders in Gold (#D4AF37) at 30% opacity to separate sections without breaking the visual flow.

## Shapes

The shape language is **Sharp (0)**. 

To maintain the high-fashion, architectural aesthetic, all buttons, inputs, and image containers must have 0px corner radii. Right angles convey a sense of precision and formality. The only exception is the use of circular "dots" for paginators or radio buttons to provide a soft counterpoint to the rigid grid.

## Components

- **Buttons:** Ghost-style by default. Use thin Off-White borders with Tenor Sans uppercase text. On hover, fill with Gold (#D4AF37) and transition text to Obsidian.
- **Inputs:** Simple bottom-border only. Labels (Tenor Sans) float above the line. The active state changes the bottom border to Gold.
- **Cards:** No shadows. Use a subtle Forest Green tint for the background and a 0.5px border. Images within cards should have a slight "zoom" transition on hover.
- **Chips/Tags:** Small Tenor Sans text encased in a 1px border. No background fill unless active.
- **Navigation:** Primary links are Tenor Sans regular, uppercase, with an animated underline that expands from the center on hover.
- **Editorial Images:** Use "Letterbox" aspect ratios (21:9 or 16:9) to enhance the cinematic feel of the system.