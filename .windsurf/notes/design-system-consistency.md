# Vesna Design System - Consistency Guidelines

## Navigation Header Standards

**NOTE**: This project now uses a **Universal Navbar Component** loaded via JavaScript. Do not hardcode navbars in individual pages.

### Universal Navbar Architecture

- **Source File**: `components/navbar.html` - Single source of truth
- **Loader**: `js/navbar-loader.js` - Dynamically injects navbar into all pages
- **Placeholder**: `<div id="navbar-placeholder"></div>` - Insert in each page where navbar should appear
- **Active State**: Automatically detected via JavaScript based on current URL

### Usage in Pages

Add to `<head>`:

```html
<!-- No additional CSS needed - included in main stylesheet -->
```

Add to `<body>` where navbar should appear:

```html
<!-- Universal Navbar -->
<div id="navbar-placeholder"></div>
```

Add before closing `</body>`:

```html
<!-- Universal Navbar Loader -->
<script src="js/navbar-loader.js"></script>
<!-- For pages in /pages/ folder: -->
<script src="../js/navbar-loader.js"></script>
```

### Logo

- **Text**: VESNΛ (Greek lambda Λ instead of A)
- **Font**: Audiowide for "VESN", Exo 2 for "Λ"
- **Color**: text-on-background (#e5e2e1, white-ish)
- **Sizes**: text-3xl (mobile) / text-4xl (desktop)
- **Tracking**: tracking-[0.3em]
- **Classes**: `font-audiowide` for logo, `lambda-exo2` for lambda character

### Navigation Links

- **Font Family**: Tenor Sans
- **Style**: Uppercase
- **Size**: text-[11px]
- **Letter Spacing**: tracking-[0.15em]
- **Default Color**: text-on-surface-variant
- **Hover**: text-on-background + animated underline
- **Active**: text-primary + border-b border-primary pb-1

### Underline Animation (from Atelier page)

```css
.nav-underline-anim {
  position: relative;
}
.nav-underline-anim::after {
  content: "";
  position: absolute;
  width: 0;
  height: 1px;
  bottom: -2px;
  left: 50%;
  background-color: #f2ca50;
  transition: all 0.5s ease;
  transform: translateX(-50%);
}
.nav-underline-anim:hover::after {
  width: 100%;
}
```

### Header Layout

- **Background**: bg-neutral-950/80 backdrop-blur-sm
- **Border**: border-b border-neutral-900
- **Height**: h-20 (mobile) / h-24 (desktop)
- **Padding**: px-5 sm:px-8 lg:px-20
- **Structure**: Flexbox, justify-between, items-center

### Icons

- **Shopping Bag Only**: Remove search icon for consistency
- **Size**: text-xl (20px)
- **Color**: text-primary (#c9a84c)

### Navigation Items (All Pages) - Universal Order

1. **Home** - Links to `index.html`
2. **Picks** - Links to `pages/picks.html`
3. **Collections** - Links to `pages/collections.html`
4. **Atelier** - Links to `pages/product.html`
5. **Journal** - Links to `pages/guide.html`
6. **About** - Links to `pages/about.html`

**Note**: All pages must maintain this exact order. The active page should have `text-primary border-b border-primary pb-1` classes.

## Color Palette

### Primary Gold

- **Hex**: #c9a84c
- **Tailwind**: primary, primary-container
- **Usage**: Active links, icons, hover accents, text selection

### Background

- **Hex**: #0a0a0a (near black)
- **Tailwind**: background, surface, surface-container-lowest

### Text Colors

- **Primary Text**: #e5e2e1 (text-on-background, text-on-surface)
- **Secondary Text**: #d0c5b2 (text-on-surface-variant)
- **Muted**: #666666 (neutral-500, stone-500)

### Borders

- **Subtle**: #242424 (border-[#242424])
- **Accent**: #c9a84c/30 or amber-500/30

## Footer Standards

### Layout

- **Structure**: Centered, single column
- **Background**: bg-[#0a0a0a]
- **Border**: border-t border-[#242424]
- **Padding**: py-16 (top/bottom), px-12 (sides)
- **Max Width**: max-w-[1440px] mx-auto

### Logo

- Same as header logo
- Centered at top

### Footer Links (All Combined)

1. Privacy Policy
2. Terms of Service
3. Affiliate Disclosure
4. Contact
5. Shipping & Returns

- **Font**: Tenor Sans
- **Style**: Uppercase
- **Size**: text-[10px]
- **Letter Spacing**: tracking-widest
- **Color**: text-[#666666] → hover:text-[#f0ebe0]
- **Layout**: Flex row, centered, gap-8

### Copyright

- **Text**: "© 2024 VESNA. ALL RIGHTS RESERVED."
- **Font**: Tenor Sans
- **Color**: text-[#c9a84c]
- **Style**: Uppercase, text-[10px], tracking-widest

### Affiliate Disclosure

- **Text**: "Vesna is a curated platform. We may earn a commission from products purchased through our links, supporting our editorial independence and high-standard curation."
- **Font**: text-[9px]
- **Color**: text-[#666666]
- **Style**: Uppercase, tracking-widest, centered, max-w-2xl

## Text Selection

```css
::selection {
  background-color: #c9a84c;
  color: #000;
}
```

## Typography Standards

### Font Families

- **Logo**: [Chosen from demo]
- **Navigation**: Tenor Sans
- **Body**: DM Sans or Spectral
- **Headlines**: Cormorant Garamond or DM Serif Display

### Font Sizes

- **Nav Links**: text-[11px]
- **Footer Links**: text-[10px]
- **Copyright**: text-[10px]
- **Affiliate Disclosure**: text-[9px]

## Files to Maintain Consistency

- `index.html` - Landing page
- `pages/picks.html` - Picks listing
- `pages/collections.html` - Collections listing
- `pages/product.html` - Product detail (Atelier)

## Implementation Checklist

- [ ] Logo uses chosen Tesla-style font with Greek lambda (Λ)
- [ ] All nav links use Tenor Sans
- [ ] Underline animation applied to all hover states
- [ ] Shopping bag icon only (no search)
- [ ] Consistent gold color (#c9a84c) for accents
- [ ] Footer has all 5 combined links
- [ ] Text selection highlight is gold
- [ ] Mobile menu matches desktop navigation items
