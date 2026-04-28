# Vesna - Curated Living Platform

A Next.js 14 + Supabase platform for curated products with a story.

## Tech Stack

- **Framework:** Next.js 14 (App Router)
- **Database:** Supabase (PostgreSQL)
- **Auth:** Supabase Auth
- **UI:** Tailwind CSS + Shadcn UI
- **AI:** Groq + Llama-4-Scout (Venus AI)
- **Email:** Brevo (Sendinblue)
- **Hosting:** Vercel

## Project Structure

```
vesna-next/
├── app/
│   ├── (admin)/          # Admin dashboard routes
│   │   ├── dashboard/
│   │   └── products/
│   ├── (public)/          # Public-facing routes
│   │   ├── curated/       # Victory's picks
│   │   ├── shop/          # Full catalog
│   │   ├── archive/       # Collections + Atelier merged
│   │   ├── journal/
│   │   └── about/
│   └── api/               # API routes
│       ├── venus/         # AI chat endpoint
│       └── track-click/   # Analytics endpoint
├── components/
│   ├── ui/               # Shadcn UI components
│   └── admin/            # Admin-specific components
├── lib/
│   ├── supabase/         # Supabase clients
│   └── utils.ts
├── types/
│   └── database.ts       # TypeScript types
└── schema.sql            # Database schema
```

## Quick Start

1. **Install dependencies:**

   ```bash
   npm install
   ```

2. **Set up environment variables:**

   ```bash
   cp .env.local.example .env.local
   # Edit .env.local with your Supabase and API keys
   ```

3. **Set up Supabase:**
   - Create project at [supabase.com](https://supabase.com)
   - Run `schema.sql` in the SQL Editor
   - Copy project URL and anon key to `.env.local`

4. **Run development server:**

   ```bash
   npm run dev
   ```

5. **Open [http://localhost:3000](http://localhost:3000)**

## Admin Access

After creating the admin user in Supabase Auth:

```sql
-- Set user as admin
UPDATE profiles SET role = 'admin' WHERE email = 'victory@vesna.ng';
```

Admin dashboard available at `/admin`

## Deployment

Deploy to Vercel:

```bash
vercel --prod
```

Don't forget to add environment variables in Vercel dashboard!

## Features

- ✅ Curated product catalog
- ✅ Admin dashboard for Victory
- ✅ Venus AI chat assistant
- ✅ Affiliate click tracking
- ✅ Email newsletter (Brevo)
- ✅ Responsive design
- ✅ Dark mode UI
