-- ---------------------------------------------------------------------------
-- Marketer role.
--
-- Grants the /marketer dashboard to azizulishak0710@gmail.com. The admin
-- account (orisa.digital@gmail.com) already reaches it via the 'admin' role,
-- so nothing here changes for admin.
--
-- Role changes are intentionally not exposed via the API (no update policy on
-- profiles) — run this in the Supabase SQL editor.
-- ---------------------------------------------------------------------------

-- Covers a future signup: same shape as 001, with the marketer email added.
-- Replacing the function keeps the existing on_auth_user_created trigger bound.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, role)
  values (
    new.id,
    new.email,
    case
      when lower(new.email) = 'orisa.digital@gmail.com' then 'admin'
      when lower(new.email) = 'azizulishak0710@gmail.com' then 'marketer'
      else 'user'
    end
  )
  on conflict (id) do nothing;
  return new;
end $$;

-- Covers an account that has already signed up (the trigger ran when the role
-- was still 'user', so it needs backfilling).
update public.profiles
set role = 'marketer'
where lower(email) = 'azizulishak0710@gmail.com'
  and role is distinct from 'marketer';
