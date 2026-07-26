# Cordoba LMS — Go-Live Guide (lms.cordobatraining.com)

The app is a **static website** — there is no server to install and no Node.js to run.
The backend (database, logins, files) lives in the cloud on **Supabase**, and its
address is already built into the files. So "deploying" just means **uploading one
folder to Hostinger**.

**File to upload:** `cordoba-lms-dist.zip` (in the `D:\CordobaApp\` folder — 767 KB)

---

## Who needs to do this
The subdomain `lms.cordobatraining.com` lives on **Ankit's** Hostinger account.
So this must be done by **one of**:
1. **Ankit**, following the steps below, **or**
2. **Ankit adds Ricardo** to the account (Hostinger → *Account Sharing*) so Ricardo can do it, **or**
3. **Ankit shares his screen** and Ricardo guides him through the steps by chat.

---

## Step-by-step (Hostinger hPanel — ~5 minutes)

### 1. Make sure the subdomain exists
- hPanel → **Domains → Subdomains**
- Confirm `lms` (for `cordobatraining.com`) is listed. Note its **folder path**
  (usually `/domains/cordobatraining.com/public_html/lms` or `/public_html/lms`).
- If it doesn't exist, create it: subdomain = `lms`, then note the folder it makes.

### 2. Open the subdomain's folder
- hPanel → **Files → File Manager**
- Navigate into the subdomain folder from step 1.
- **Delete anything already inside** it (e.g. a default `index.html` or a "coming soon" page).

### 3. Upload the app
- Click **Upload** (top-right) → choose **`cordoba-lms-dist.zip`**.
- Wait for it to finish (it's small).

### 4. Extract it
- Right-click the uploaded `cordoba-lms-dist.zip` → **Extract**.
- Extract **into the current folder** (the subdomain folder).
- After extracting, you should see at the folder root:
  `index.html`, `assets/`, `.htaccess`, `logo.png`, `hero.jpg`, `favicon.svg`, `_redirects`
- Delete the `cordoba-lms-dist.zip` file afterwards (no longer needed).

> ⚠️ **Important:** the `.htaccess` file is hidden by default. In File Manager, enable
> **"Show hidden files"** (Settings / the gear icon) and confirm `.htaccess` is present
> at the root. Without it, page refreshes on inner pages (e.g. /admin) show a 404.

### 5. Turn on HTTPS (free)
- hPanel → **Security → SSL** → make sure an SSL certificate is **active** for
  `lms.cordobatraining.com` (Hostinger issues one free; click *Install* if needed).

### 6. Open it
- Visit **https://lms.cordobatraining.com**
- The Cordoba landing page should load, with the login card. 🎉

---

## One recommended Supabase setting (2 minutes)
So password-reset and future Microsoft-365 links point to the real domain:

- Supabase dashboard → **Authentication → URL Configuration**
- **Site URL:** `https://lms.cordobatraining.com`
- **Redirect URLs:** add `https://lms.cordobatraining.com/**`
- Save.

(The app already works for email/password login without this — it's for polish.)

---

## Test after go-live
1. Open `https://lms.cordobatraining.com`
2. Log in with an admin account → you land on the dashboard
3. Refresh the page while on `/admin` — it should stay (not 404). If it 404s, the
   `.htaccess` didn't make it — re-check step 4.
4. Create a batch, enrol a learner, mark attendance — confirms the live database works.

---

## Still to do later (not required for go-live)
- **Microsoft 365 login** — needs an Azure app registration + enabling the Azure
  provider in Supabase (Authentication → Providers → Azure). The "Sign in with
  Microsoft 365" button is in the UI and will work once that's connected.
- **File storage** (uploaded documents/videos) — Supabase Storage or Cloudflare R2.

---

## How to produce a fresh `cordoba-lms-dist.zip` after code changes
On the dev PC:
```
cd D:\CordobaApp\app
npm.cmd run build
```
Then re-zip the `dist` folder contents (keep the hidden `.htaccess`). The zip in
`D:\CordobaApp\cordoba-lms-dist.zip` is what gets uploaded.
