Hosting + Database
Netlify + Supabase. No question.
Let me explain each decision:
Netlify over Vercel for Phase 1:

Netlify Forms is already in the plan for contact forms — that's free and requires zero backend code
Netlify Functions work perfectly for the four serverless functions in the build doc
The \_headers and \_redirects files are already written for Netlify
Vercel's advantage (better Next.js integration, Edge Functions) becomes relevant at Phase 2. Switch to Vercel then when you migrate to Next.js — Vercel is made by the Next.js team and the DX is noticeably better.

Supabase over Firebase:
This one matters a lot for Vesna's trajectory.
Firebase gives you NoSQL (Firestore). Your Phase 2 schema — profiles, spring_posts, follows, curator_certificates — is relational data. Modeling that in Firestore requires denormalization and fan-out writes that get genuinely painful at the complexity level Vesna reaches by Phase 3 (wallet transactions, dispute chains, escrow flows). You'd be fighting the database.
Supabase gives you Postgres. The Phase 2-3 schema in the build doc is already written as SQL. pgvector (Phase 3 semantic search for Venus) is a Postgres extension — it doesn't exist in Firebase. The RLS policies are already written as SQL. Supabase Realtime (Spring live comments) works on Postgres replication — equivalent to Firestore real-time listeners but on a relational foundation.
Firebase's advantages (offline-first mobile, extremely simple auth setup) don't outweigh what you'd lose. Vesna is a web platform, not a mobile app.
So the stack cadence is:
PhaseHostingDatabaseNotes1NetlifyAirtable (CMS only)No Supabase yet — not needed2VercelSupabaseNext.js migration, auth, Spring3+VercelSupabasePayments, marketplace, Sprout
Supabase free tier is sufficient through Phase 2. You don't even touch it until Phase 2 — Phase 1 is Airtable as CMS + Netlify Functions as the API layer, exactly as the build doc specifies.
