# Creatix – Creator Business Management Platform

A unified platform connecting Indian digital creators and brand partners: from creator discovery and collaboration proposals to AI contract intelligence and financial profitability tracking.

Built strictly according to the **Creatix Product Requirements Document (PRD v1.0)**.

---

## 🚀 Quick Start (Running in Mock Mode)

Creatix is pre-configured to run out of the box in **Mock Mode** using in-memory and persistent `localStorage` data. No database, server, or API key setup is required to run the full application right now.

```bash
# 1. Install dependencies
npm install

# 2. Run local development server
npm run dev

# 3. Open in browser
http://localhost:5173
```

---

## 🔑 Demo Credentials

Click the one-click demo login buttons on the `/login` screen, or use these credentials:

| Role | Demo Identity | Email | Password |
| :--- | :--- | :--- | :--- |
| **Creator** | Aanya Sharma (Beauty & Lifestyle) | `aanya@creatix.dev` | `creator123` |
| **Brand** | Kaya Botanics India (Ayurvedic D2C) | `partners@kayabotanics.com` | `brand123` |

*Note: You can also register any new Creator or Brand account from the `/signup` screen.*

---

## 🧪 Verification & Acceptance Tests

Execute the automated test suites from your terminal:

```bash
# Verify PRD §7 Money Math & Calculation Rules (6/6 tests)
node scripts/test-calculations.js

# Verify PRD §12 End-to-End Aanya Demo Flow
node scripts/verify-e2e.js

# Production Build & TypeScript Typecheck
npm run build
```

---

## 🏗️ Architecture & Dual Data Layer

Pages **never call Supabase directly**. All interactions go through `src/lib/api/`:
* **Mock Implementation (`src/lib/api/mockApi.ts`):** Active by default. Simulates network latencies (1.5s for AI analysis) and persists all additions/edits across page reloads in `localStorage`.
* **Supabase Implementation (`src/lib/api/supabaseApi.ts`):** Parallel typed implementation wired to `@supabase/supabase-js`, PostgreSQL RPC functions, and Edge Functions.
* **Toggle (`.env`):**
  ```env
  # Set to 'false' when connecting live Supabase
  VITE_USE_MOCK=true
  VITE_SUPABASE_URL=https://your-project.supabase.co
  VITE_SUPABASE_ANON_KEY=your-anon-key
  ```

See [MOCKS.md](file:///E:/Creatix/MOCKS.md) for the complete register of mocked functions, simulated behaviors, and untested cloud surfaces.

---

## 🔌 Connecting Live Supabase & Cloud Services

When you are ready to connect real cloud infrastructure:

1. **Database Migration:**
   * Run the SQL migration in [supabase/migrations/20261114000000_schema_and_rls.sql](file:///E:/Creatix/supabase/migrations/20261114000000_schema_and_rls.sql) in your Supabase SQL Editor.
   * This creates all tables, triggers (`handle_new_user`, `prevent_role_update`), atomic RPC functions (`accept_enquiry`, `reject_enquiry`), and strict RLS policies.
2. **Supabase Auth Settings:**
   * Go to **Authentication > Providers > Email**: toggle **Confirm email** to **OFF** for instant demo logins.
   * Go to **Authentication > URL Configuration**: add your Vercel deployment domain to **Redirect URLs**.
3. **Deploy Edge Function:**
   * Deploy `supabase/functions/analyze-contract` with secrets:
     ```bash
     supabase secrets set LLM_API_KEY="your-gemini-or-openai-key"
     supabase secrets set OPENAI_BASE_URL="https://generativelanguage.googleapis.com/v1beta/openai"
     supabase secrets set LLM_MODEL="gemini-2.5-flash"
     supabase functions deploy analyze-contract
     ```
4. **Switch Data Layer:**
   * Update `.env` with `VITE_USE_MOCK=false`.

---

## 📱 Mobile & Responsive Testing
* Tested at **375px** viewport width: tables automatically format into touch-friendly cards, navigation shifts to a 44px fixed bottom tab bar, and forms stack cleanly.
