# Microsoft 365 Login — Setup Guide

The "Sign in with Microsoft 365" button is already coded. To make it work, connect
Microsoft ↔ Supabase (one-time setup, ~15 min).

**The one value you'll reuse everywhere (Supabase callback URL):**
```
https://egqfwnjfznhnobjgvoud.supabase.co/auth/v1/callback
```

---

## Part A — Register the app in Microsoft (Azure / Entra)
> Needs the **Cordoba Microsoft 365 admin account** (ask Ankit). Done in the Azure portal.

1. Go to **https://portal.azure.com** → sign in with the Cordoba admin account.
2. Search **"App registrations"** → **+ New registration**.
3. **Name:** `Cordoba LMS`
4. **Supported account types:** choose
   - *"Accounts in any organizational directory and personal Microsoft accounts"* — if anyone with a Microsoft account can sign in, **or**
   - *"Single tenant"* — if only Cordoba staff/students should sign in.
5. **Redirect URI:** platform = **Web**, value =
   `https://egqfwnjfznhnobjgvoud.supabase.co/auth/v1/callback`
6. Click **Register**.
7. On the **Overview** page, copy the **Application (client) ID** and the **Directory (tenant) ID** → keep them.
8. Left menu → **Certificates & secrets** → **+ New client secret** → description `supabase`, expiry `24 months` → **Add**.
9. **Immediately copy the secret's "Value"** (it's hidden after you leave the page).

You now have: **Client ID**, **Tenant ID**, **Client Secret (Value)**.

---

## Part B — Enable Azure in Supabase
> You can do this (Supabase dashboard).

1. Supabase → **Authentication** → **Sign In / Providers** → find **Azure** → toggle **Enable**.
2. **Client ID (Application ID):** paste the Client ID from Part A.
3. **Secret Value:** paste the Client Secret Value from Part A.
4. **Azure Tenant URL:**
   - For *any* Microsoft account: `https://login.microsoftonline.com/common`
   - For *Cordoba only*: `https://login.microsoftonline.com/<TENANT-ID>` (use the Directory/tenant ID).
5. **Save**.

---

## Part C — Supabase URL configuration
> You can do this.

1. Supabase → **Authentication** → **URL Configuration**.
2. **Site URL:** `https://lms.cordobatraining.com`
3. **Redirect URLs** — add both:
   - `https://lms.cordobatraining.com`
   - `http://localhost:5173`  (for local testing)
4. **Save**.

---

## Part D — Test
1. Open the app → click **"Sign in with Microsoft 365"**.
2. You're sent to the Microsoft login page → sign in.
3. You're redirected back → logged into the LMS.

**Note:** a first-time Microsoft user is created as a **Learner** by default. An admin can
change their role on the **People** page (or via SQL).

---

### Troubleshooting
- *"Unsupported provider" / provider not enabled* → Part B not saved.
- *Redirect/callback mismatch* → the Redirect URI in Part A step 5 must be EXACTLY the callback URL above.
- *Redirects to a blank page after login* → add the app URL to Part C Redirect URLs.
