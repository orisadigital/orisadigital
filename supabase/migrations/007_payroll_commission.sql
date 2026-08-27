-- ---------------------------------------------------------------------------
-- Payroll: what a "Commission" payment is for.
--
-- Free text, and text rather than numeric on purpose: the money itself already
-- lives in basic_salary (shown as "Amount"). This column describes the
-- commission — which sale, which client, which period — not its value.
--
-- The sibling of `project` (006), which does the same job for a project fee.
-- Only meaningful when payment_type = 'Commission'; null otherwise.
--
-- Run this in the Supabase SQL editor, or add the column via the Table Editor
-- (payroll -> + New column -> name: commission, type: text).
-- ---------------------------------------------------------------------------

alter table public.payroll add column if not exists commission text;

notify pgrst, 'reload schema';

-- Confirms the column is really there. Expected result: commission
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'payroll' and column_name = 'commission';
