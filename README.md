# Vesna — Affiliate Product Showcase

A curated digital product showcase website for Ebenezer Victory, built with vanilla HTML, CSS, and JavaScript.

## Quick Links

- **Live Site**: [your-site.netlify.app](https://your-site.netlify.app)
- **Airtable Base**: [airtable.com](https://airtable.com)

---

## Getting Started

### For Developers

1. **Clone/Download** the project files
2. **Install Netlify CLI**: `npm install -g netlify-cli`
3. **Login**: `netlify login`
4. **Deploy**: `netlify deploy --prod`

### Environment Variables (Netlify Dashboard)

Go to Site Settings → Environment Variables and add:

| Variable | Value | Where to Find |
|----------|-------|---------------|
| `AIRTABLE_API_KEY` | `keyXXXXXXXXXXXXXX` | Airtable → Account → Developer → API key |
| `AIRTABLE_BASE_ID` | `appXXXXXXXXXXXXXX` | Airtable Base URL |
| `AIRTABLE_TABLE_NAME` | `Products` | Your table name |

---

## Airtable Setup

### 1. Create Account
- Go to [airtable.com](https://airtable.com)
- Sign up with email
- Verify account

### 2. Create Base
1. Click "Add a base"
2. Choose "Start from scratch"
3. Name it: "Product Catalog" or "Vesna Inventory"

### 3. Create Table Structure

Create a table named **Products** with these fields:

| Field Name | Field Type | Purpose | Example |
|------------|------------|---------|---------|
| Product Name | Single line text | Display title | Digital Marketing Masterclass |
| Price | Currency | Show cost | 25000 |
| Sale Price | Currency | Optional discount | 20000 |
| Image | Attachment | Product photo | Upload JPG/PNG |
| Affiliate Link | URL | Click destination | https://selar.co/... |
| Category | Single select | Group products | Courses, Ebooks, Tools, Templates |
| Description | Long text | Details, benefits | Full product description |
| Featured | Checkbox | Highlight on homepage | ☑️ = show in featured section |
| Active | Checkbox | Show/hide from site | ☑️ = live |

**Note**: The following fields are auto-created by Airtable:
- **Date Added**: Created time (enable in field options)

### 4. Add Sample Products

Add 3-5 products to test. Make sure:
- Active is checked for products you want visible
- Featured is checked for homepage highlights
- Images are attached
- Affiliate links are valid URLs

### 5. Share API Access

1. Go to [airtable.com/account](https://airtable.com/account)
2. Scroll to Developer section
3. Click "Generate API key"
4. Copy the key (starts with `key...`)
5. Share via WhatsApp/Telegram with developer

**Base ID**: Look at your base URL:
`airtable.com/[BASE_ID]/...`

---

## Adding New Products

1. Open your Airtable base
2. Click "+" to add new record
3. Fill in all fields:
   - Product Name (required)
   - Price (required)
   - Sale Price (optional, leave blank if no discount)
   - Image (optional but recommended)
   - Affiliate Link (required for the buy button to work)
   - Category (select from dropdown)
   - Description (optional)
   - Featured (check if you want it on homepage)
   - Active (must be checked to appear on site)
4. Save record
5. Refresh website — changes appear automatically!

---

## Customization

### Brand Colors
Edit `css/styles.css` → `:root` section:

```css
:root {
  /* Change these values to update colors */
  --color-gold:         #c9a84c;  /* Primary accent */
  --color-gold-light:   #e2c06a;  /* Hover state */
  --color-green:        #2d6a4f;  /* Secondary accent */
  --color-bg:           #0e0e0e;  /* Background */
}
```

### Brand Name
- Search for "Vesna" in all files to update the brand name
- Don't forget the favicon SVG!

### About Page
Edit `pages/about.html` directly to update Ebenezer's story and social links.

---

## Troubleshooting

### Products Not Showing
1. Check if **Active** is checked in Airtable
2. Verify API key is correct in Netlify
3. Check browser console for errors (F12)

### Images Not Loading
1. Ensure images are attached (not linked URLs)
2. Check image file format (JPG, PNG, GIF supported)
3. Airtable attachments can take time to process

### Affiliate Links Not Working
1. Ensure URLs start with `https://`
2. Test links manually in Airtable

---

## Deployment

### Deploy to Netlify

1. Push code to GitHub (optional)
2. Connect repo to Netlify
3. Set environment variables
4. Deploy!

### Custom Domain

1. Go to Netlify → Domain Management
2. Add custom domain (e.g., `vesna.ng`)
3. Update DNS records as shown
4. Enable HTTPS (automatic with Netlify)

---

## Future Enhancements

- [ ] Contact form
- [ ] Search functionality
- [ ] Product ratings/reviews
- [ ] Click tracking to Airtable
- [ ] Email newsletter signup
- [ ] Mobile app (Capacitor)

---

## Credits

- **Developer**: MiniMax Agent
- **Designer**: Based on design system for Ebenezer Victory
- **Built with**: Vanilla HTML, CSS, JavaScript, Netlify Functions

---

## License

This project is for Ebenezer Victory's personal use. All rights reserved.

---

*Last updated: March 26, 2026*
