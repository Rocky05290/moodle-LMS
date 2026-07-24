-- ============================================================
--  Cordoba — allow ADMIN to delete people from the directory
--  Run ONCE in Supabase → SQL Editor → New query → RUN.
--
--  Batches, courses, enrolments etc. already allow admin delete
--  (the admin_write_* "for all" policies). Only `profiles` was
--  missing a DELETE policy, so this adds it.
-- ============================================================

create policy admin_delete_profile on profiles
  for delete using (auth_role() = 'admin');
