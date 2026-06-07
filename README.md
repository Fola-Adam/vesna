# Vesna — Curated Living

A curated collection of exceptional products and insights for intentional living. Built with Next.js 14 and Supabase.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Styling:** Tailwind CSS with custom Material Design 3 tokens
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth (SSR)
- **AI:** Groq SDK (Venus chat assistant)
- **PWA:** next-pwa with service worker

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Set up environment variables:
   ```bash
   cp .env.example .env.local
   ```
   Fill in your Supabase URL and anon key.

3. Run the dev server:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000)

## Project Structure

```
app/
├── (auth)/login/        # Auth pages
├── (public)/            # Public pages (home, about, archive, curated, journal, shop)
├── (admin)/             # Admin dashboard (products, analytics, subscribers)
├── api/venus/           # Venus AI chat endpoint
├── layout.tsx           # Root layout with fonts and metadata
└── globals.css          # Global styles and design tokens
components/              # Reusable UI components
hooks/                   # Custom React hooks
lib/
├── supabase/            # Supabase client (server, client, middleware)
└── utils.ts             # Utility functions (cn helper)
public/                  # Static assets and images
types/                   # TypeScript type definitions
```

## Build

```bash
npm run build
```

## License

Private — Victory Ebenezer