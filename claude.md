# LST Poultry Farm — Web App

## Stack
- Next.js 14 (App Router)
- Supabase (PostgreSQL + Auth + Storage)
- Tailwind CSS
- Recharts for dashboard charts
- Deployed on Vercel

## Users & roles
- field_staff — mobile only, data entry (daily check-in, feed, eggs)
- accountant — tablet/laptop, financial entry (expenses, sales)
- owner — any device, read-only dashboard

## Key rules
- Field staff UI must work on cheap Android phones — large tap targets, minimal scrolling
- Owner dashboard is fully read-only — no forms, no edit buttons
- All amounts in Kenyan Shillings (Ksh)
- Dates in YYYY-MM-DD format internally, displayed as "1 May 2025"
- Receipt photos upload to Supabase Storage

## Database
[Paste the full schema here]

## Design reference
- Green primary: #1D9E75
- Dashboard mockup already built — match it closely
