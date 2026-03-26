# Vesna — Affiliate Product Showcase

## 1. Concept & Vision

**Vesna** is a curated digital product showcase for Ebenezer Victory, a 16-year-old affiliate marketer. The site feels like receiving recommendations from a trusted friend — warm, personal, and genuinely helpful. The dark, luxurious aesthetic with gold and green accents creates a premium feel that elevates digital products beyond typical "sales pages." Every interaction should feel intentional and refined.

## 2. Design Language

### Aesthetic Direction
**"Quiet luxury meets digital warmth"** — Inspired by high-end editorial sites and creator-focused storefronts like Gumroad and Stan Store. Dark backgrounds create focus, while gold and green accents add warmth without feeling aggressive.

### Color Palette
```
Background & Surfaces:
- #0e0e0e     (BG)          — Primary dark background
- #1a1a1a     (Surface)    — Card backgrounds, elevated surfaces
- #222222     (Surface 2)  — Secondary surfaces, inputs
- #2a2a2a     (Border)     — Subtle borders and dividers

Brand Green:
- #1b4332     (Green Dim)  — Darkest green, backgrounds
- #2d6a4f     (Green)      — Primary green
- #40916c     (Green Light)— Bright green for emphasis

Brand Gold:
- #8a6f2e     (Gold Dim)   — Darkest gold, borders
- #c9a84c     (Gold)       — Primary gold accent
- #e2c06a     (Gold Light) — Brightest gold for hover states

Text:
- #f5f0e8     (Text)       — Primary text (warm off-white)
- #9a9490     (Muted)      — Secondary text
- #5a5652     (Faint)      — Tertiary/disabled text
```

### Typography
```
Display Font: Caveat (Google Fonts)
- Headings, hero text, accent phrases
- Weights: 400, 600, 700
- Cursive warmth for brand personality

Body Font: Tenor Sans (Google Fonts)
- Labels, navigation, section headers
- Uppercase with letter-spacing for elegance

UI Font: DM Sans (Google Fonts)
- Body text, descriptions, form elements
- Light weight (300) for readability
```

### Spatial System
```
--space-1:   4px
--space-2:   8px
--space-3:   12px
--space-4:   16px
--space-5:   20px
--space-6:   24px
--space-8:   32px
--space-10:  40px
--space-12:  48px
--space-16:  64px
--space-20:  80px
--space-24:  96px
```

### Motion Philosophy
- **Entrance animations**: Subtle fade-up on scroll (opacity + translateY, 400ms)
- **Hover states**: Quick response (150-250ms), slight lift with shadow expansion
- **Card interactions**: 4px lift on hover with green glow
- **Buttons**: Scale to 1.02 on hover with gold glow
- **Page transitions**: Smooth scroll behavior
- **Loading**: Shimmer skeleton animations for content loading

### Visual Assets
- **Icons**: Simple SVG icons inline (search, menu, arrow, external link)
- **Product images**: From Airtable attachments, lazy-loaded
- **Decorative**: Subtle radial gradients in hero, gold dividers
- **No placeholder images**: Use CSS gradients initially, swap with real Airtable images

## 3. Layout & Structure

### Site Architecture
```
/ (Homepage)
├── Hero section with brand intro
├── Featured products (3-6 items from Airtable)
├── Category showcase
└── About snippet

/products (All Products)
├── Filter chips (Categories)
├── Product grid (all active products)
└── Empty state for no results

/product/[id] (Product Detail)
├── Large product image
├── Product info (name, price, description)
├── Affiliate CTA button
└── Related products

/about (About Page)
├── Ebenezer's story
├── Why she recommends products
└── Social/contact links

/category/[name] (Category View)
├── Category header
├── Filtered product grid
└── Back to all products link
```

### Responsive Breakpoints
```
Mobile:  < 640px   (1 column grid)
Tablet:  640-1023px (2 column grid)
Desktop: 1024-1279px (3 column grid)
Wide:    1280px+  (4 column grid)
```

### Navigation
- Sticky navbar with blur backdrop
- Logo left, links center, CTA right
- Mobile: hamburger menu (future enhancement)

## 4. Features & Interactions

### Airtable Integration
- **API**: Fetch via Netlify serverless function (hides API key)
- **Endpoint**: `/api/products` — returns all active products
- **Filtering**: Only `Active = true` records
- **Sorting**: Featured first, then by Date Added descending
- **Error handling**: Toast notification with retry option

### Product Cards
- **Hover**: Lift 4px, border turns green-dim, green glow appears
- **Image**: Scale 1.04 on hover
- **Badges**: Absolute positioned, top-left corner
  - Sale badge (gold) when sale price exists
  - Featured badge (green) when featured = true
  - New badge when added within 30 days
- **Price display**: Current price prominent, original price strikethrough if sale

### Category Filtering
- **Chips**: All, Courses, Ebooks, Tools, Templates
- **Active state**: Gold border and background glow
- **Behavior**: Instant filter with fade animation
- **URL**: Updates with query param for shareability (future)

### Affiliate Links
- **Button text**: "Get It Now" on cards, context-appropriate on detail
- **Behavior**: Opens in new tab (target="_blank" rel="noopener")
- **Tracking**: Future enhancement — store click in Airtable

### Search (Future)
- **Input**: Full-width on mobile, inline on desktop
- **Behavior**: Filter products by name/description

### Loading States
- **Skeleton cards**: Animated shimmer while loading
- **Count**: Show 4-8 skeletons during fetch

### Error States
- **Toast notification**: Slides in from bottom-right
- **Success**: Green left border, checkmark icon
- **Error**: Red left border, X icon, retry message
- **Duration**: Auto-dismiss after 5 seconds

### Empty States
- **No products**: Friendly message with suggestion to check back
- **No results for filter**: "No products in this category yet"

## 5. Component Inventory

### Button
```
States:
- Default: Gold background, dark text
- Hover: Lighter gold, gold shadow glow, slight lift
- Active: Pressed down effect
- Disabled: Muted colors, no cursor
- Loading: Spinner icon (future)

Variants:
- Primary: Gold fill (default CTA)
- Secondary: Green outline (secondary actions)
- Ghost: Text only (tertiary actions)
- Sizes: lg (hero), md (cards), sm (filters)
```

### Product Card
```
States:
- Default: Dark surface, subtle border
- Hover: Green border, green glow, lift
- Loading: Skeleton shimmer
- Error: Placeholder with broken image icon

Structure:
- Image container (4:3 aspect ratio)
- Badge slot (top-left)
- Body: category, title, price
- Footer: CTA button (full width)
```

### Badge
```
Variants:
- Sale: Gold colors
- Featured: Green colors
- New: Subtle gold tint

All: Rounded full, uppercase text, small padding
```

### Filter Chip
```
States:
- Default: Transparent, border, muted text
- Hover: Green border, bright text
- Active: Gold border, gold text, gold glow background
```

### Input
```
States:
- Default: Dark background, subtle border
- Focus: Green border, green glow ring
- Error: Red border (future validation)
- Disabled: Reduced opacity

Style: Rounded full, placeholder text faded
```

### Toast Notification
```
Variants:
- Success: Green left border, check icon
- Error: Red left border, X icon

Animation: Slide up from bottom-right
Duration: 5 seconds auto-dismiss
```

### Navigation
```
- Sticky position
- Blur backdrop (16px)
- Logo: Caveat font with gold period
- Links: Uppercase, letter-spaced
- CTA: Primary button (Browse Picks)
```

### Hero Section
```
- Full viewport height (85vh minimum)
- Radial gradient background accents
- Eyebrow: Small caps, green
- Title: Caveat display, large
- Subtitle: DM Sans light, muted
- CTA buttons: Primary + Secondary
```

### Footer
```
- Brand name (logo style)
- Tagline
- Copyright + disclosure
- Top border divider
```

## 6. Technical Approach

### Frontend Stack
- **HTML5**: Semantic markup
- **CSS**: Vanilla with custom properties (no framework)
- **JavaScript**: Vanilla ES6+, modules
- **No build step**: Direct browser execution

### File Structure
```
/vesna
├── index.html           (Homepage)
├── products.html        (All products)
├── about.html           (About page)
├── css/
│   └── styles.css       (Complete design system)
├── js/
│   ├── app.js           (Main application logic)
│   ├── api.js           (Airtable API calls)
│   └── components.js    (Reusable component renderers)
├── pages/
│   ├── product.html     (Product detail template)
│   └── category.html    (Category view template)
├── functions/
│   └── api/products.js  (Netlify serverless function)
├── SPEC.md
└── README.md
```

### API Design

#### Netlify Function: GET /api/products
```javascript
// Request: None (uses configured env vars)
// Response:
{
  "products": [
    {
      "id": "recXXXXXXXXXXXX",
      "name": "Digital Marketing Masterclass",
      "price": 25000,
      "salePrice": 20000,
      "image": "https://airtable.com/...",
      "affiliateLink": "https://selar.co/...",
      "category": "Courses",
      "description": "...",
      "featured": true,
      "dateAdded": "2026-03-01T00:00:00.000Z"
    }
  ]
}
```

#### Airtable Schema
```
Base: Product Catalog
Table: Products

Fields:
- Product Name     (Single line text)
- Price           (Currency, in Naira)
- Sale Price      (Currency, optional)
- Image           (Attachment)
- Affiliate Link  (URL)
- Category        (Single select: Courses, Ebooks, Tools, Templates)
- Description     (Long text)
- Featured        (Checkbox)
- Active          (Checkbox)
- Date Added      (Created time, auto)
```

### Environment Variables (Netlify)
```
AIRTABLE_API_KEY=keyXXXXXXXXXXXXXX
AIRTABLE_BASE_ID=appXXXXXXXXXXXXXX
```

### Performance Targets
- First Contentful Paint: < 1.5s
- Time to Interactive: < 3s
- Lighthouse Performance: 90+
- Image lazy loading for below-fold images
- Minimal JavaScript bundle (< 20KB)

### SEO
- Semantic HTML structure
- Meta title and description per page
- Alt text for all images
- Open Graph tags for social sharing
- Structured data for products (future)

### Browser Support
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+
