-- ============================================================
--  Optional: give courses real marketing descriptions, level & price
--  (The catalog cards already look great with auto-derived values;
--   run this to show real prices and custom blurbs like the demo.)
--  Supabase → SQL Editor → New query → RUN.
-- ============================================================

alter table courses add column if not exists description text;
alter table courses add column if not exists level       text;
alter table courses add column if not exists price       text;

update courses set level = 'Intermediate', price = '180 BHD',
  description = 'Comprehensive Cisco networking foundations — topologies, the OSI & TCP/IP models, VLANs, routing, switching, IP services and secure device hardening.'
  where code = 'CCNA';

update courses set level = 'Advanced', price = '320 BHD',
  description = 'Enterprise-scale routing and design — OSPF, EIGRP and BGP, campus architecture, redundancy, QoS and secure segmented access.'
  where code = 'CCNP';

update courses set level = 'Intermediate', price = '260 BHD',
  description = 'Security operations end to end — SOC roles and the threat landscape, packet analysis, IDS/IPS & SIEM, endpoint hardening, cryptography and incident response.'
  where code = 'SEC';
