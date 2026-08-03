-- Orisa Digital: initial Supabase schema
-- Migrated from Base44 entities (base44/entities/*.jsonc).
-- Run this whole file in the Supabase SQL editor.

-- ---------------------------------------------------------------------------
-- Helpers
-- ---------------------------------------------------------------------------

create extension if not exists pgcrypto;

-- Base44 ids are 24-char hex strings, so ids are text (new rows get a UUID
-- string) — this lets exported Base44 records keep their original ids.
create or replace function public.set_updated_date()
returns trigger language plpgsql as $$
begin
  new.updated_date = now();
  return new;
end $$;

-- ---------------------------------------------------------------------------
-- Profiles (user roles). Row auto-created on signup; the owner email becomes
-- admin. Role changes are intentionally not exposed via the API (no update
-- policy) — use the dashboard/SQL to change roles.
-- ---------------------------------------------------------------------------

create table if not exists public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  email text,
  full_name text,
  role text not null default 'user',
  created_date timestamptz not null default now()
);

alter table public.profiles enable row level security;

drop policy if exists "profiles readable by authenticated" on public.profiles;
create policy "profiles readable by authenticated"
  on public.profiles for select to authenticated using (true);

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

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- ---------------------------------------------------------------------------
-- Entity tables
-- Date-like fields are text on purpose: Base44 stored monthly renewals as
-- "MM-DD" and other dates as "YYYY-MM-DD"; text keeps both importable and
-- sorts correctly.
-- ---------------------------------------------------------------------------

create table if not exists public.clients (
  id text primary key default gen_random_uuid()::text,
  client_name text not null,
  contact_position text,
  contact_email text,
  contact_number text,
  company_name text,
  company_industry text,
  company_reg_number text,
  company_website text,
  company_address text,
  amount numeric default 0,
  inquiry_source text default 'website',
  notes text,
  status text default 'active',
  converted_from text default 'prospect',
  date_converted text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.deals (
  id text primary key default gen_random_uuid()::text,
  deal_name text not null,
  company_name text not null,
  contact_name text,
  contact_number text,
  amount numeric default 0,
  stage text default 'online_prospect',
  inquiry_source text default 'website',
  date text,
  follow_up_status text default 'interested',
  next_follow_up text,
  follow_up_notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.prospects (
  id text primary key default gen_random_uuid()::text,
  prospect_name text not null,
  company_name text,
  contact_email text not null,
  contact_number text,
  inquiry_source text default 'website',
  notes text,
  status text default 'new',
  date_received text,
  follow_up_status text default 'interested',
  next_follow_up text,
  follow_up_notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.projects (
  id text primary key default gen_random_uuid()::text,
  project_name text not null,
  client_id text,
  company_name text,
  person_in_charge text,
  contact_number text,
  email text,
  sale_amount numeric default 0,
  is_recurring boolean default false,
  recurring_amount numeric default 0,
  recurring_cycle text default 'monthly',
  domain_names jsonb default '[]'::jsonb,
  webmaster_email text,
  webmaster_username text,
  webmaster_password text,
  domain_name text,
  domain_name_other text,
  domain_username text,
  domain_password text,
  domain_backup_code text,
  hosting_name text,
  hosting_name_other text,
  hosting_username text,
  hosting_password text,
  hosting_backup_code text,
  cpanel_username text,
  cpanel_password text,
  wp_admin1_username text,
  wp_admin1_password text,
  wp_admin2_username text,
  wp_admin2_password text,
  wp_client_username text,
  wp_client_password text,
  domain_expiry_date text,
  hosting_expiry_date text,
  delivery_date text,
  status text default 'active',
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.domain_hosting (
  id text primary key default gen_random_uuid()::text,
  item_name text not null,
  item_type text default 'domain',
  provider text,
  username text,
  password text,
  backup_code text,
  cost numeric default 0,
  billing_cycle text default 'yearly',
  renewal_date text,
  client_id text,
  company_name text,
  status text default 'active',
  notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.follow_ups (
  id text primary key default gen_random_uuid()::text,
  prospect_id text not null,
  status text default 'interested',
  notes text,
  date text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.knowledge_base (
  id text primary key default gen_random_uuid()::text,
  title text not null,
  type text not null default 'qa',
  question text,
  answer text,
  content text,
  file_url text,
  file_name text,
  source_url text,
  status text default 'active',
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.software_plugins (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text default 'software',
  provider text,
  username text,
  password text,
  license_key text,
  seats numeric default 1,
  cost numeric default 0,
  billing_cycle text default 'yearly',
  renewal_date text,
  client_id text,
  company_name text,
  status text default 'active',
  notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.subscriptions (
  id text primary key default gen_random_uuid()::text,
  name text not null,
  category text,
  provider text,
  username text,
  password text,
  cost numeric default 0,
  billing_cycle text default 'monthly',
  renewal_date text,
  client_id text,
  company_name text,
  status text default 'active',
  notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

create table if not exists public.tasks (
  id text primary key default gen_random_uuid()::text,
  task_title text not null,
  date text not null,
  is_completed boolean default false,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

-- updated_date triggers + RLS (any authenticated user has full access — this
-- is an internal single-team CRM; anonymous visitors have none).
do $$
declare
  t text;
begin
  foreach t in array array[
    'clients','deals','prospects','projects','domain_hosting','follow_ups',
    'knowledge_base','software_plugins','subscriptions','tasks'
  ] loop
    execute format('drop trigger if exists set_updated_date on public.%I', t);
    execute format(
      'create trigger set_updated_date before update on public.%I
       for each row execute function public.set_updated_date()', t);
    execute format('alter table public.%I enable row level security', t);
    execute format('drop policy if exists "authenticated full access" on public.%I', t);
    execute format(
      'create policy "authenticated full access" on public.%I
       for all to authenticated using (true) with check (true)', t);
  end loop;
end $$;

-- ---------------------------------------------------------------------------
-- Storage bucket for knowledge-base / brief uploads
-- ---------------------------------------------------------------------------

insert into storage.buckets (id, name, public)
values ('uploads', 'uploads', true)
on conflict (id) do nothing;

-- Anonymous uploads allowed: the public Website Design Brief form submits a
-- generated PDF without a login (matches previous Base44 behavior).
drop policy if exists "uploads public write" on storage.objects;
create policy "uploads public write"
  on storage.objects for insert to public
  with check (bucket_id = 'uploads');

drop policy if exists "uploads public read" on storage.objects;
create policy "uploads public read"
  on storage.objects for select to public
  using (bucket_id = 'uploads');

-- ---------------------------------------------------------------------------
-- Scheduled jobs (ports of base44/functions/autoRenewAssets and
-- renewalReminders). Monthly renewals are "MM-DD"; yearly/3-year are full
-- ISO dates that get advanced past today when due.
-- ---------------------------------------------------------------------------

create or replace function public.auto_renew_assets()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t text;
  r record;
  yrs int;
  new_date date;
  renewed jsonb := '{}'::jsonb;
  n int;
begin
  foreach t in array array['domain_hosting','software_plugins','subscriptions'] loop
    n := 0;
    for r in execute format(
      'select id, renewal_date, billing_cycle from public.%I
       where coalesce(status, '''') <> ''cancelled''
         and billing_cycle in (''yearly'', ''3_years'')
         and length(coalesce(renewal_date, '''')) = 10', t)
    loop
      yrs := case r.billing_cycle when '3_years' then 3 else 1 end;
      begin
        new_date := r.renewal_date::date;
      exception when others then
        continue;
      end;
      if new_date > current_date then
        continue;
      end if;
      while new_date <= current_date loop
        new_date := new_date + make_interval(years => yrs);
      end loop;
      execute format(
        'update public.%I set renewal_date = $1, status = ''active'' where id = $2', t)
        using to_char(new_date, 'YYYY-MM-DD'), r.id;
      n := n + 1;
    end loop;
    renewed := renewed || jsonb_build_object(t, n);
  end loop;
  return renewed;
end $$;

create or replace function public.renewal_reminders()
returns jsonb language plpgsql security definer set search_path = public as $$
declare
  t text;
  r record;
  expiry date;
  dd int;
  days_left int;
  title text;
  created int := 0;
begin
  foreach t in array array['software_plugins','subscriptions'] loop
    for r in execute format(
      'select coalesce(name, ''item'') as name, renewal_date, billing_cycle
       from public.%I
       where coalesce(status, '''') <> ''cancelled''
         and billing_cycle in (''monthly'', ''yearly'')
         and coalesce(renewal_date, '''') <> ''''', t)
    loop
      if length(r.renewal_date) <> 10 then
        -- monthly "MM-DD": next occurrence of that day-of-month
        dd := nullif(split_part(r.renewal_date, '-', 2), '')::int;
        if dd is null then continue; end if;
        begin
          expiry := make_date(
            extract(year from current_date)::int,
            extract(month from current_date)::int, dd);
        exception when others then
          continue;
        end;
        if expiry < current_date then
          expiry := expiry + interval '1 month';
        end if;
      else
        begin
          expiry := r.renewal_date::date;
        exception when others then
          continue;
        end;
        if expiry < current_date then continue; end if;
      end if;

      days_left := expiry - current_date;
      if (r.billing_cycle = 'monthly' and days_left not in (7, 3, 1))
         or (r.billing_cycle = 'yearly' and days_left not in (30, 14, 7, 3)) then
        continue;
      end if;

      title := format('Renewal reminder: %s expires %s (%sd)',
                      r.name, to_char(expiry, 'YYYY-MM-DD'), days_left);
      if not exists (select 1 from public.tasks where task_title = title) then
        insert into public.tasks (task_title, date)
        values (title, to_char(current_date, 'YYYY-MM-DD'));
        created := created + 1;
      end if;
    end loop;
  end loop;
  return jsonb_build_object('created', created);
end $$;

-- Schedule daily runs. pg_cron must be enabled (Dashboard -> Database ->
-- Extensions -> pg_cron); this block enables it if possible and skips
-- scheduling with a notice if not.
do $$
begin
  begin
    create extension if not exists pg_cron;
  exception when others then
    raise notice 'pg_cron not available: % — enable it in Dashboard > Database > Extensions, then re-run the cron.schedule calls below.', sqlerrm;
    return;
  end;
  perform cron.unschedule(jobid) from cron.job where jobname in ('auto-renew-assets','renewal-reminders');
  perform cron.schedule('auto-renew-assets', '0 1 * * *', $job$select public.auto_renew_assets()$job$);
  perform cron.schedule('renewal-reminders', '30 1 * * *', $job$select public.renewal_reminders()$job$);
end $$;
