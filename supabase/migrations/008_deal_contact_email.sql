-- ---------------------------------------------------------------------------
-- Deals: the contact's email address.
--
-- Prospects already have contact_email; deals did not, so a deal shown on the
-- Prospects page had a blank email and anything typed into it there was
-- dropped on save. Nullable, unlike prospects.contact_email, because existing
-- deals have no email to backfill.
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching frontend:
-- the Add Deal form sends contact_email, and inserts fail until the column
-- exists. Or add it via the Table Editor
-- (deals -> + New column -> name: contact_email, type: text).
-- ---------------------------------------------------------------------------

alter table public.deals add column if not exists contact_email text;

notify pgrst, 'reload schema';

-- Confirms the column is really there. Expected result: contact_email
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'deals' and column_name = 'contact_email';
