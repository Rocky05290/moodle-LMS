# Cordoba Training Center — Custom Web App (LMS + ERP)
## Analysis & Build Plan  ·  v1  ·  July 2026

---

## 1. What we are actually building (the key insight)

This is **not just an LMS**. Reading the client's demo code carefully, the data model tells the real story:

- Users carry a **CPR number** (Bahrain national ID)
- Learners belong to **companies** (Batelco, Alba HR) — there is a `company` role
- Batches are coded `CTC-CCNA-2601`, with start/end dates, times, and **total hours**
- There is a **Tamkeen calendar**, **holidays database**, **training-day calculation**
- There is a **trainer signature pad** and **printed batch + individual attendance registers**
- The word **"Tamkeen" appears 11+ times** in his code

➡️ **Conclusion: this is a Bahrain _Tamkeen-compliant training-provider system_.**
Tamkeen (Bahrain Labour Fund) subsidises corporate training and requires **audit-proof,
signed attendance registers, exact training-day/hour tracking, and compliance report bundles.**

**This is genuinely why Moodle failed.** Moodle is a teaching platform; it cannot produce
Tamkeen-format signed registers, corporate-sponsor batch billing, or ERP-style compliance
bundles without heavy custom development. The client's instinct to build custom is **correct**.

---

## 2. Confirmed logic (from his demo)

### Roles (5)
| Role | Purpose |
|---|---|
| **Admin** | Master course inventory, users, batches, assign trainers/learners, Batch Health |
| **Trainer** | Own batches, attendance (grid + QR), rubric grading, return-for-redo, reports |
| **Learner** | Today view, sequential modules, submissions, grades, evaluation form |
| **Auditor / QA** | Read-only. Search by batch code / learner. Compliance Report Bundle export |
| **Company** | (his demo) Corporate sponsor — sees their sponsored employees' progress |

### Core data model (taken from his demo)
```
users        : id, firstName, lastName, email, mobile, cpr, role
courses      : id, title, category, modules[], highlights[], totalHours
batches      : id, courseId, batchCode, trainerId, startDate, endDate,
               startTime, endTime, totalHours
enrollments  : id, learnerId, batchId, completionProgress
attendance   : learnerId + batchId + date  ->  P | L1 | L2 | L3 | A
gradebook    : learnerId + batchId + assessment(pre|act|mid|post) -> score
holidays     : date -> name
```

### Attendance statuses (identical to what we already built)
`P` Present · `L1` Late 5min · `L2` Late 10min · `L3` Late 15min · `A` Absent

---

## 3. Recommended tech stack

| Layer | Choice | Why |
|---|---|---|
| **Frontend** | **React + Vite + TypeScript + Tailwind** | Client asked for React. His demo is already Tailwind → design ports over directly. Vite = fast. |
| **Database + Auth + API** | **Supabase** (Postgres) | Client already chose it. Gives DB + login + auto REST API + **Row Level Security**. |
| **Permissions** | **Supabase RLS policies** | This is how we make the Auditor *physically incapable* of editing — enforced in the database, not just hidden buttons. Audit-proof. |
| **File storage** | **Cloudflare R2** (videos/PDFs) + Supabase Storage (small docs) | Client's choice. R2 has no egress fees — right call for lecture videos. |
| **PDF reports** | **html2pdf.js** (already in his demo) | Client-side, free, pixel-perfect signed registers. |
| **Hosting** | **Hostinger** (static build) | React builds to plain files → drop in public_html. Client already pays for it. |

### ⚠️ Important architectural decision: **we do NOT need a Node/Express backend for v1.**
Supabase already provides the database, authentication, and a secure API with row-level
permissions. Adding a separate Node server would double the work, cost money to host, and
add a failure point. **Skip it.** (If we later need scheduled emails or heavy PDF jobs, we add
Supabase Edge Functions — still free, still no server to manage.)

### Cost
Supabase free tier + Cloudflare R2 free tier + existing Hostinger = **$0/month** to start. ✅

---

## 4. Build phases (realistic)

| Phase | What gets built | Effort |
|---|---|---|
| **0 — Foundation** | Repo, Vite+React+TS+Tailwind, Supabase project, full DB schema + RLS | 2–3 days |
| **1 — Auth & shell** | Login, 5 roles, protected routes, app layout/navigation, design system | 3–4 days |
| **2 — Admin** | Courses, users, **bulk CSV import**, batches (auto code + end-date calc), assign trainer/learners, Batch Health dashboard | 5–7 days |
| **3 — Trainer** | Trainer dashboard, attendance grid (P/L1/L2/L3/A), QR check-in, rubric grading, return-for-redo | 5–7 days |
| **4 — Learner** | Today view, sequential module unlock, submissions, grades, course evaluation form | 4–5 days |
| **5 — Auditor** | Read-only dashboard, search by batch/learner, timestamped audit log viewer | 3–4 days |
| **6 — Reports** | Tamkeen batch + individual attendance registers, trainer signature, Compliance Report Bundle, Excel/PDF export | 4–6 days |
| **7 — Polish & deploy** | UI refinement, responsive, testing, deploy to Hostinger, handover | 3–4 days |

**Realistic total: ~5–7 weeks of focused work.**

> 🔴 **Honesty note:** "2 days" is achievable for a **new UI skin on his existing demo** —
> not for the production app with real database, logins and reports. These are two different
> things and must be communicated clearly to avoid a broken promise.

---

## 5. Recommended approach: **UI first, then engine**

The client said: *"As long as there is no changes with logic, I would love to explore another UI."*

So:
1. **Week 1 — New UI (what he asked for in 2 days):** Rebuild his screens in React + Tailwind
   with a genuinely premium design. Runs on mock data (same as his demo does now).
   → He sees fast, visible progress and approves the look.
2. **Weeks 2+ — Wire the engine:** Swap mock data for Supabase (auth, DB, RLS, storage) role by role.

This de-risks everything: he gets something impressive quickly, and we don't build a beautiful
app on top of a design he doesn't like.

---

## 6. Risks to manage

| Risk | Mitigation |
|---|---|
| **Scope creep** — "LMS + ERP, not limited to LMS" is unbounded | Lock v1 scope to the 5 roles + the workflow he wrote. Everything else = v2. |
| **Unpaid work** — this is a *new, much bigger* project than the Moodle job | Agree a milestone/payment plan **before** Phase 2. See §8. |
| **Timeline promise** — "2 days" | Clarify: 2 days = new UI demo. Full app = weeks. Say it now, not later. |
| **Tamkeen compliance details** | Ask the client for a **real Tamkeen attendance register sample** so reports match exactly. |
| **Data loss** | The Moodle site stays live until the new app is proven. Do not delete it. |

---

## 7. What we still need FROM the client

1. A **real Tamkeen attendance register / report sample** (PDF or Excel) — critical for Phase 6.
2. Confirmation of the **5 roles** (is "Company/Corporate" role in v1 or v2?).
3. His **Supabase** project access (or let us create it under his account).
4. **Cloudflare R2** account/bucket.
5. Course content (the CyberOps/CCNA PDFs already collected can be reused).

---

## 8. Commercial note (for the freelancer)

The original job was a **Moodle setup (~$150)** and is ~90% complete and working.
This is now a **custom software build** — a different project of a different size.

Recommended framing to the client:
> "Happy to build this — it's the right call for Tamkeen compliance. Because it's a full custom
> application rather than the Moodle setup we agreed, can we set it up as its own project with
> milestones? I'll deliver the new UI first so you can see it immediately."

**Do not** delete or abandon the Moodle site until the new app is delivered and paid.

---

## 9. Immediate next steps

- [ ] Confirm plan + scope with client
- [ ] Agree milestones/payment
- [ ] Phase 0: scaffold React app in `D:\CordobaApp`
- [ ] Design the DB schema (tables + RLS) — draft ready to go
- [ ] Build the new premium UI (mock data) for client approval

---
*All project files live in `D:\CordobaApp`.*
