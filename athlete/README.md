# Athlete OS

Personal training database and analysis dashboard for Yuma Tamaki.

## Current prototype
- Mobile-first dashboard
- Natural-language Quick Log with confirmation before save
- Timeline filters: RUN / RACE / WEIGHT / TECH
- 100m performance trend
- Key performance records
- Technique board
- Local record search (AI Coach prototype)
- Browser localStorage persistence

## Data integrity rules
1. Keep official competition results separate from training times.
2. Never label a training time as a PB.
3. Store the original raw text for every entry.
4. Separate observation/fact from interpretation.
5. Unknown values remain null; never infer missing values.
6. User confirms parsed data before persistence.

## Production architecture
Recommended: frontend + Supabase Postgres/Auth + server-side OpenAI Responses API.

Do not expose an OpenAI API key or Supabase service_role key in browser code. Use a server route / Edge Function for AI extraction. Browser clients should use a Supabase publishable key with RLS enabled.

`supabase.sql` contains the initial database schema and per-user RLS policies.

## Next production step
Create a Supabase project, apply `supabase.sql`, add authentication, then replace localStorage with authenticated database CRUD. Add a server-side parser using Structured Outputs to convert raw training notes into typed records while retaining `raw_text`.