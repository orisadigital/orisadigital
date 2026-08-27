-- ---------------------------------------------------------------------------
-- Payroll: what a payment is for.
--
-- Distinct from payment_method, which is how the money moved (bank transfer,
-- cash, cheque, e-wallet). This is the reason for the payment: salary, a
-- project fee, commission, and so on.
--
-- Free text at the database level, constrained to a list in the UI — the same
-- approach employee_position takes. Keeping the constraint in the UI rather
-- than a CHECK means the list can change without a migration; the cost is that
-- the database will accept any string.
--
-- Nullable by design: a payment need not be categorised.
--
-- Run this in the Supabase SQL editor.
-- ---------------------------------------------------------------------------

alter table public.payroll add column if not exists payment_type text;

-- PostgREST answers from a cached copy of the schema. Until it reloads, writes
-- to a column that genuinely exists still fail with
--   PGRST204: Could not find the 'payment_type' column of 'payroll' in the schema cache
-- so ask for the reload explicitly rather than waiting on it.
notify pgrst, 'reload schema';

-- Confirms the column is really there. Expected result: payment_type
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'payroll' and column_name = 'payment_type';
