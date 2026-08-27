-- ---------------------------------------------------------------------------
-- Payroll: which project a "Project Fee" payment relates to.
--
-- Stores the project NAME, not a foreign key to public.projects. That is
-- deliberate for a financial record:
--   * renaming a project must not retroactively change what a past payment
--     says it was for;
--   * deleting a project must not blank the payroll history.
-- The name is picked from the live projects list in the UI, so it is accurate
-- at the moment of payment and frozen thereafter.
--
-- Only meaningful when payment_type = 'Project Fee'; null otherwise.
--
-- Run this in the Supabase SQL editor, or add the column via the Table Editor
-- (payroll -> + New column -> name: project, type: text).
-- ---------------------------------------------------------------------------

alter table public.payroll add column if not exists project text;

notify pgrst, 'reload schema';

-- Confirms the column is really there. Expected result: project
select column_name from information_schema.columns
where table_schema = 'public' and table_name = 'payroll' and column_name = 'project';
