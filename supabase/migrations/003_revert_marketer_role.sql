-- ---------------------------------------------------------------------------
-- Revert the marketer role (undoes 002).
--
-- The /marketer dashboard has been removed, so the role no longer means
-- anything. This restores the database to its pre-002 state.
--
-- 002 is kept in the repo as a record of what was applied — this migration,
-- not its deletion, is what undoes it.
--
-- Role changes are intentionally not exposed via the API (no update policy on
-- profiles) — run this in the Supabase SQL editor.
-- ---------------------------------------------------------------------------

-- Restore the original trigger body from 001: admin for the owner email,
-- 'user' for everyone else.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case when lower(new.email) = 'orisa.digital@gmail.com' then 'admin' else 'user' end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Put the account back to 'user'. Scoped to role = 'marketer' so a role set
-- deliberately since 002 is left alone.
update public.profiles
set role = 'user'
where lower(email) = 'azizulishak0710@gmail.com'
  and role = 'marketer';
