---
name: Vesna Digital
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
  on-surface-variant: '#d0c5b2'
  inverse-surface: '#e5e2e1'
  inverse-on-surface: '#313030'
  outline: '#99907e'
  outline-variant: '#4d4637'
  surface-tint: '#e6c364'
  primary: '#e6c364'
  on-primary: '#3d2e00'
  primary-container: '#c9a84c'
  on-primary-container: '#503d00'
  inverse-primary: '#755b00'
  secondary: '#95d4b3'
  on-secondary: '#003824'
  secondary-container: '#12533a'
  on-secondary-container: '#87c6a5'
  tertiary: '#cbc6bc'
  on-tertiary: '#323029'
  tertiary-container: '#afaba1'
  on-tertiary-container: '#414038'
  error: '#ffb4ab'
  on-error: '#690005'
  error-container: '#93000a'
  on-error-container: '#ffdad6'
  primary-fixed: '#ffe08f'
  primary-fixed-dim: '#e6c364'
  on-primary-fixed: '#241a00'
  on-primary-fixed-variant: '#584400'
  secondary-fixed: '#b1f0ce'
  secondary-fixed-dim: '#95d4b3'
  on-secondary-fixed: '#002114'
  on-secondary-fixed-variant: '#0e5138'
  tertiary-fixed: '#e7e2d7'
  tertiary-fixed-dim: '#cac6bc'
  on-tertiary-fixed: '#1d1c15'
  on-tertiary-fixed-variant: '#49473f'
  background: '#131313'
  on-background: '#e5e2e1'
  surface-variant: '#353534'
typography:
  display-hero:
    fontFamily: DM Serif Display
    fontSize: 72px
    fontWeight: '400'
    lineHeight: '1.1'
    letterSpacing: -0.02em
  section-header:
    fontFamily: Cinzel
    fontSize: 14px
    fontWeight: '400'
    lineHeight: '1.5'
    letterSpacing: 0.15em
  body-main:
    fontFamily: Spectral
    fontSize: 18px
    fontWeight: '300'
    lineHeight: '1.6'
    letterSpacing: 0.01em
  accent-italic:
    fontFamily: Playfair Display
    fontSize: 18px
    fontWeight: '400'
    lineHeight: '1.6'
  button-label:
    fontFamily: Tenor Sans
    fontSize: 12px
    fontWeight: '400'
    lineHeight: '1'
    letterSpacing: 0.1em
  logo:
    fontFamily: Tangerine
    fontSize: 32px
    fontWeight: '700'
    lineHeight: '1'
spacing:
  unit: 4px
  gutter: 24px
  margin-mobile: 20px
  margin-desktop: 80px
  container-max: 1440px
---

## Brand & Style

This design system is built upon the concept of "Quiet Luxury"—an aesthetic that prioritizes substance, texture, and refined restraint over loud visual cues. It is designed for the discerning Nigerian consumer, blending high-end editorial sensibilities with a welcoming "digital warmth."

The style is a sophisticated blend of **Minimalism** and **High-Contrast Editorial**. It utilizes expansive negative space to allow curated products to breathe, while employing razor-sharp structural layouts that evoke the feeling of a premium physical lookbook. The emotional response is one of exclusivity, calmness, and trust, positioning digital commerce as a gallery-like experience rather than a high-volume marketplace.

## Colors

The palette is anchored in deep obsidian tones to establish a premium "dark editorial" foundation. 

- **Primary (Gold):** Used sparingly for high-value interactions, signaling luxury and prestige.
- **Secondary (Green):** Represents growth and the "digital warmth," used for success states or subtle brand moments.
- **Surface Strategy:** We use a three-tier dark system to create depth without relying on shadows. The primary background is absolute, while surfaces 1 and 2 define content hierarchy and interactive containers.
- **Typography Tones:** Body text uses an off-white parchment shade to reduce eye strain against the dark background, maintaining the warmth of high-quality paper.

## Typography

Typography is the primary vehicle for the brand’s voice. 

- **Hierarchy:** Use **DM Serif Display** for hero moments to command attention with its high-contrast strokes. **Cinzel** serves as the architectural framework for section headers, providing a sense of permanence and structure.
- **Body & Accents:** **Spectral** is set at a light weight (300) with generous line height (1.6) to ensure a breezy, effortless reading experience. Insert **Playfair Display Italic** within body copy to highlight key concepts or curated notes.
- **Utility:** All functional elements—buttons, navigation links, and small labels—must use **Tenor Sans** in uppercase. This provides a clean, modern counterpoint to the more traditional serifs.
- **Decorative:** Reserve **Corinthia** and **Cinzel Decorative** for low-information, high-vibe elements like watermark-style backgrounds or specific editorial pull-quotes.

## Layout & Spacing

The layout follows a **Fixed Grid** philosophy to maintain the rigid structure of a luxury magazine. 

- **The Grid:** A 12-column grid system with wide 24px gutters. 
- **Rhythm:** Spacing should follow a strict 4px baseline, but utilize large-scale jumps (e.g., 64px, 80px, 120px) between sections to emphasize the "Quiet Luxury" focus on whitespace.
- **Margins:** Desktop views should utilize significant horizontal margins (80px+) to center the content and create a "runway" effect for product imagery. Content should feel intentionally placed, never crowded.

## Elevation & Depth

This design system avoids traditional drop shadows in favor of **Tonal Layers** and **Low-Contrast Outlines**.

- **Depth through Color:** Elevation is expressed by moving from the `#0a0a0a` background to `#141414` (Surface) and `#1c1c1c` (Surface 2). 
- **Borders:** Use the `#242424` border color for structural separation. These should be thin (1px) and used to create a "box" layout feel common in high-fashion digital experiences.
- **Interactions:** On hover, surfaces may subtly lighten or borders may transition to the Gold accent (`#c9a84c`) to provide tactile feedback without breaking the flat, editorial plane.

## Shapes

To maintain an architectural and "High-Fashion" feel, this design system utilizes a **Sharp (0)** roundedness level. 

- **Containers:** All cards, input fields, and buttons must have 0px corner radii. This reinforces the "editorial" aesthetic and creates a sense of precision.
- **Imagery:** Product photography should always be housed in sharp-edged containers. 
- **Exceptions:** No exceptions are permitted for standard UI components. The only "softness" in the UI should come from the cursive typography (Tangerine/Corinthia), providing a contrast between the rigid structure and the fluid human touch.

## Components

### Buttons
- **Primary:** Solid `#c9a84c` (Gold) background with `#0a0a0a` text. 0px border-radius. Typography: Tenor Sans (Uppercase).
- **Secondary:** Transparent background with a 1px border of `#f0ebe0`. Text in `#f0ebe0`.
- **Tertiary/Ghost:** No border or background. Tenor Sans with high letter spacing and a thin underline on hover.

### Cards
- **Product Cards:** Background: `#141414`. No padding on imagery—images should bleed to the edge of the card. Text information (Price, Title) sits below the image with generous padding in Spectral 300.
- **Editorial Cards:** Use Surface 2 (`#1c1c1c`) with Cinzel headers.

### Input Fields
- Underline style preferred over boxed style. 1px `#242424` bottom border that transitions to `#c9a84c` on focus. Label in Tenor Sans.

### Navigation
- Top-aligned, fixed. Links are Tenor Sans Uppercase. The Logo (Tangerine) is always centered or far left, acting as the anchor of the page.

### Chips & Tags
- Rectangular (0px radius). Border: 1px `#242424`. Background: Transparent. Text: Tenor Sans, 10px.