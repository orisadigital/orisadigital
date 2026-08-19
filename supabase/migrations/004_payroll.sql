-- ---------------------------------------------------------------------------
-- HR: payroll records.
--
-- Standalone by design — there is no employees table, so each record carries
-- the employee's name and position directly. If an employee directory is added
-- later, these columns are what an employee_id would replace.
--
-- Net pay is deliberately NOT stored: it is derived in the UI as
-- basic_salary + allowances - deductions, so it cannot drift from its inputs.
--
-- Date-like fields are text, matching the rest of the schema (see 001):
-- pay_period is "YYYY-MM", pay_date is "YYYY-MM-DD".
--
-- Run this in the Supabase SQL editor.
-- ---------------------------------------------------------------------------

create table if not exists public.payroll (
  id text primary key default gen_random_uuid()::text,
  employee_name text not null,
  employee_position text,
  employee_email text,
  pay_period text,
  pay_date text,
  basic_salary numeric default 0,
  allowances numeric default 0,
  deductions numeric default 0,
  payment_method text default 'bank_transfer',
  status text default 'pending',
  notes text,
  created_by text,
  created_date timestamptz not null default now(),
  updated_date timestamptz not null default now()
);

-- Same updated_date trigger and RLS policy the tables in 001 get.
--
-- NOTE: "authenticated full access" means any signed-in user can read and write
-- salary figures — the same policy every other table carries. That was fine for
-- CRM data; it is worth a deliberate decision for payroll. Tightening it to
-- admins only would look like:
--
--   using (exists (select 1 from public.profiles p
--                  where p.id = auth.uid() and p.role = 'admin'))
--
-- Left as-is here so this migration stays consistent with the existing schema.
drop trigger if exists set_updated_date on public.payroll;
create trigger set_updated_date before update on public.payroll
  for each row execute function public.set_updated_date();

alter table public.payroll enable row level security;

drop policy if exists "authenticated full access" on public.payroll;
create policy "authenticated full access" on public.payroll
  for all to authenticated using (true) with check (true);
