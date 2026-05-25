# Vesna — Affiliate Product Showcase

A curated digital product showcase for Victory. Honest recommendations, no fluff.

## Quick Start

1. Clone the repo
2. Deploy to Netlify
3. (Optional) Set up Airtable for dynamic products
4. Add environment variables in Netlify

## Environment Variables

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `AIRTABLE_API_KEY` | `keyXXXXXXXXXXXXXX` | Airtable → Account → Developer → API key |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | Airtable Base URL |
| `AIRTABLE_TABLE_NAME` | `Products` | Your table name |

**Note:** If Airtable is not configured, the site uses hardcoded products from `picks.html`.

## Airtable Setup

Create a table named **Products** with these fields:

| Field Name | Field Type | Example |
|------------|------------|---------|
| Product Name | Single line text | Digital Marketing Masterclass |
| Price | Currency (NGN) | 25000 |
| Sale Price | Currency | 20000 |
| Image | Attachment | Upload JPG/PNG/WebP |
| Affiliate Link | URL | https://selar.co/... |
| Category | Single select | Courses, Ebooks, Tools, Templates |
| Description | Long text | Full product description |
| Why Victory | Long text | Victory's personal endorsement |
| Platform | Single select | Selar, Gumroad, Jumia |
| WhatsApp | URL | wa.me/234XXXXXXXXXX |
| Featured | Checkbox | ☑️ = show on homepage |
| Active | Checkbox | ☑️ = live on site |
| Date Added | Created time | Auto-generated |

## Project Structure

```
vesna/
  index.html              Homepage
  pages/
    picks.html            All products (hardcoded + API fallback)
    products.html         Products redirect
    product.html          Product detail template
    about.html            Victory's story
    archive.html          Collections
    journal.html          Articles
  css/
    styles.css            Design system
  js/
    app.js                Main orchestrator
    api.js                Airtable API client (unused until Airtable configured)
    components.js         Reusable renderers
  components/
    navbar.html           Shared navbar
    mobile-bottom-nav.html  Mobile navigation
  functions/
    products.js           Netlify serverless function
  netlify.toml            Deploy config
  SPEC.md                 Design specification
```

## Design System

- **Fonts**: Caveat (display), Tenor Sans (labels), DM Sans (body), + 5 more for editorial
- **Colors**: Dark (#0e0e0e) + Gold (#c9a84c) + Green (#2d6a4f)
- **Aesthetic**: "Quiet luxury meets digital warmth"

## Adding Products

### Without Airtable (Simple)
Edit `pages/picks.html` directly. Find the `const picks = [...]` array and add/edit products.

### With Airtable (Recommended)
1. Open your Airtable base
2. Add a new record
3. Fill in: Product Name, Price, Affiliate Link, Active
4. Save — changes appear on the site within 5 minutes

## Custom Domain

1. Netlify → Domain Management
2. Add custom domain (e.g., `vesna.ng`)
3. Update DNS as shown
4. HTTPS is automatic

## Credits

Built for Ebenezer Victory. Vanilla HTML, CSS, JavaScript, Netlify Functions.
