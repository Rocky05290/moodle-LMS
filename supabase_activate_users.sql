-- ============================================================
--  Cordoba — activate the 4 demo login accounts
--  Run ONCE in Supabase → SQL Editor → New query → RUN.
--  (The accounts themselves were already created via the app.)
-- ============================================================

-- 1) Confirm the emails so the accounts can sign in
update auth.users
   set email_confirmed_at = now()
 where email in ('admin@cordoba.bh','sayed@cordoba.bh','ali@batelco.com.bh','qa@cordoba.bh')
   and email_confirmed_at is null;

-- 2) Give each account its role + display name
update profiles p set role='admin',   first_name='Ankit',  last_name='Srivastav'
  from auth.users u where u.id = p.id and u.email = 'admin@cordoba.bh';
update profiles p set role='trainer', first_name='Sayed',  last_name='Ahmed'
  from auth.users u where u.id = p.id and u.email = 'sayed@cordoba.bh';
update profiles p set role='learner', first_name='Ali',    last_name='Hassan'
  from auth.users u where u.id = p.id and u.email = 'ali@batelco.com.bh';
update profiles p set role='auditor', first_name='Qassim', last_name='Rahman'
  from auth.users u where u.id = p.id and u.email = 'qa@cordoba.bh';

-- 3) Show the result (you should see 4 rows with roles filled in)
select u.email, p.role, p.first_name, p.last_name
  from profiles p
  join auth.users u on u.id = p.id
 order by p.role;
