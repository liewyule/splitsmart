# SplitSmart

Mobile-first web app to split travel expenses with friends. Built with Next.js App Router, TypeScript, Tailwind, and Supabase (Auth + Postgres + RLS). Designed for free-tier deployment on Vercel + Supabase.

## 1) Create a Supabase project (free tier)
1. Go to Supabase and create a new project.
2. Save the project URL and anon key from **Project Settings → API**.
3. Enable Email/Password auth in **Authentication → Providers**.

## 2) Run SQL migrations
Copy-paste the SQL below into **SQL Editor** and run it (or run the migration file via Supabase CLI).

- File: `supabase/migrations/202601120001_init.sql`

This creates tables, constraints, and RLS policies.

## 3) Configure local environment variables
Create a `.env.local` file at the project root:

```
NEXT_PUBLIC_SUPABASE_URL=YOUR_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=YOUR_SUPABASE_ANON_KEY
```

No service role key is required.

## 4) Install and run locally
```
npm install
npm run dev
```

Visit `http://localhost:3000`.

## 5) Deploy to Vercel (free tier)
1. Push this repo to GitHub.
2. Create a new Vercel project and import the repo.
3. Add the same environment variables in Vercel:

```
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY
```

4. Deploy.

## Supabase schema summary
Tables:
- `profiles`
- `trips`
- `trip_members`
- `expenses`
- `expense_splits`

RLS:
- Profiles: users can read and update their own profile; authenticated users can read usernames for member lists.
- Trips: only members can read; creator can update/delete.
- Trip members: members can read; users can insert themselves to join.
- Expenses and splits: only members can read/write.

## Notes
- Trip codes are 6-digit numeric strings and remain permanent.
- Expense splits default to equal; custom splits are supported in the add/edit form.
- Settlements are suggestions only (no payment integration).

## Optional: Supabase CLI
If you want to use the CLI instead of SQL Editor:
1. Install Supabase CLI.
2. Run `supabase login` and `supabase link --project-ref <ref>`.
3. Run `supabase db push` to apply migrations.
