# NYC Classifieds

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript
- Supabase (auth + database)
- Tailwind CSS 4
- Resend (email)
- Deployed on Vercel

## Project Structure
- `app/` — Pages and API routes (App Router)
- `app/components/` — Shared React components
- `app/api/` — API route handlers
- `app/(auth)/` — Login/signup pages
- `app/[borough]/[slug]/[category]/` — Dynamic listing routes
- `lib/` — Utilities, Supabase clients, data, email, SEO
- `supabase/` — Supabase config/migrations
- `scripts/` — Dev/seed scripts

## Key Files
- `lib/supabase.ts` — Client-side Supabase client
- `lib/supabase-server.ts` — Server-side Supabase client
- `lib/data.ts` — Borough/neighborhood/category data
- `middleware.ts` — Auth/routing middleware

## Rules
- Never read or search inside `node_modules/` or `.next/`
- Never read `package-lock.json`
- When reading files, use line limits for files over 200 lines
- Keep conversations focused — suggest starting fresh when scope changes
- Use Supabase client from `lib/`, don't create new instances
- Environment variables are in `.env.local` — never commit or display them
