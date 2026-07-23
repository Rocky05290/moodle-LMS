-- ============================================================
--  Cordoba — sample seed data
--  Run AFTER supabase_schema.sql (SQL Editor → New query)
--  Seeds courses, holidays and batches. People/enrollments are
--  created through the app once users sign up (they need auth.users).
-- ============================================================

insert into courses (code, title, category, total_hours, modules) values
('CCNA', 'CCNA — Networking Fundamentals', 'Networking', 48,
 '[{"num":"01","title":"Network Fundamentals","desc":"Topologies, OSI & TCP/IP models, media types."},
   {"num":"02","title":"Routing & Switching","desc":"VLANs, static & dynamic routing, spanning tree."},
   {"num":"03","title":"IP Services & Security","desc":"DHCP, NAT, ACLs, device hardening."},
   {"num":"04","title":"Automation & Diagnostics","desc":"Troubleshooting workflow, automation basics."}]'::jsonb),
('CCNP', 'CCNP Enterprise', 'Networking', 80,
 '[{"num":"01","title":"Advanced Routing","desc":"OSPF, EIGRP and BGP at enterprise scale."},
   {"num":"02","title":"Enterprise Design","desc":"Campus architecture, redundancy and QoS."},
   {"num":"03","title":"Secure Access","desc":"Identity, segmentation and policy enforcement."}]'::jsonb),
('SEC', 'CyberOps Associate', 'Cybersecurity', 96,
 '[{"num":"01","title":"Security Operations Foundations","desc":"SOC roles, CIA triad, threat landscape."},
   {"num":"02","title":"Network Defence & Monitoring","desc":"Packet analysis, IDS/IPS, SIEM."},
   {"num":"03","title":"Endpoint Security & Cryptography","desc":"OS hardening, keys, certificates."},
   {"num":"04","title":"Forensics & Incident Response","desc":"Log collection, malware analysis."}]'::jsonb);

insert into holidays (holiday_date, name) values
('2026-05-01', 'Labour Day'),
('2026-12-16', 'National Day');

insert into batches (batch_code, course_id, start_date, end_date, start_time, end_time, total_hours, status) values
('CTC-CCNA-2601', (select id from courses where code = 'CCNA'), '2026-08-02', '2026-08-19', '10:00', '14:00', 48, 'active'),
('CTC-SEC-2602',  (select id from courses where code = 'SEC'),  '2026-09-01', '2026-10-02', '09:00', '13:00', 96, 'upcoming'),
('CTC-CCNP-2603', (select id from courses where code = 'CCNP'), '2026-10-15', '2026-11-23', '17:00', '20:00', 80, 'upcoming');
