-- ---------------------------------------------------------------------------
-- Admin access by role.
--
-- The /admin dashboard used to let in one hard-coded email. It now admits any
-- account whose profiles.role is 'admin', so more admins can be added without
-- a code change.
--
-- Run this in the Supabase SQL editor BEFORE deploying the matching frontend.
-- It makes sure the owner account has an 'admin' profile row: 001's trigger
-- only creates rows for accounts that sign up after it was installed, and
-- without this the owner could be shut out of the dashboard.
--
-- To make another account an admin afterwards:
--   update public.profiles set role = 'admin' where lower(email) = '<their email>';
-- (They must have signed up first, so their profile row exists.)
-- ---------------------------------------------------------------------------

insert into public.profiles (id, email, role)
select id, email, 'admin'
from auth.users
where lower(email) = 'orisa.digital@gmail.com'
on conflict (id) do update set role = 'admin';

-- Lists every admin. Expected: the owner, plus anyone you promoted.
select email, role from public.profiles where role = 'admin';
