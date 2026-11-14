# Creatix - Mock Register (MOCKS.md)

This register tracks every mocked capability, what it simulates, what the real backend requires, and what remains untested until live cloud services are connected.

---

## 1. Mock Implementations Table

| Mock Location | Function / Feature | What It Fakes | What Real Version Needs |
| :--- | :--- | :--- | :--- |
| `src/lib/api/mockApi.ts` | `getCurrentSession()` | Reads session from in-memory / `localStorage` (`creatix_mock_db_v1`) | Supabase Auth JWT session (`supabase.auth.getSession()`) |
| `src/lib/api/mockApi.ts` | `signIn(email, pwd)` | Matches against seeded email list or demo shortcuts; no password hash check | Supabase Auth `signInWithPassword` verifying bcrypt hash in `auth.users` |
| `src/lib/api/mockApi.ts` | `signUp(name, email, ...)` | Generates simulated `usr-<timestamp>` ID and pushes to localStorage | Supabase Auth `signUp()`, triggering PostgreSQL `handle_new_user()` trigger |
| `src/lib/api/mockApi.ts` | `signOut()` | Clears `currentUserId` in localStorage | Supabase Auth `signOut()` |
| `src/lib/api/mockApi.ts` | `updateCreatorProfile()` | Directly mutates profile in localStorage; bypasses RLS | Supabase DB `UPDATE creator_profiles` guarded by `auth.uid() = user_id` |
| `src/lib/api/mockApi.ts` | `getPublicCreatorProfile()` | Reads from localStorage; checks `is_public` | Supabase DB `SELECT` with anon RLS policy (`is_public = true`) |
| `src/lib/api/mockApi.ts` | `getDeals()`, `createDeal()` | Mutates `collaborations` array in localStorage | Supabase DB `collaborations` table with creator RLS |
| `src/lib/api/mockApi.ts` | `deleteDeal(id)` | Sets `collaboration_id = null` on linked records in localStorage | Supabase DB foreign keys with `ON DELETE SET NULL` constraints |
| `src/lib/api/mockApi.ts` | `financialRecords` CRUD | Mutates `financialRecords` array in localStorage | Supabase DB `financial_records` table with creator RLS |
| `src/lib/api/mockApi.ts` | `enquiries` CRUD | Mutates `enquiries` in localStorage | Supabase DB `enquiries` table with brand/creator RLS |
| `src/lib/api/mockApi.ts` | `acceptEnquiry()` | Mutates status to `accepted` and creates collaboration in localStorage | Supabase PostgreSQL RPC `accept_enquiry()` with atomic row locking |
| `src/lib/api/mockApi.ts` | `searchCreators()` | Filters in-memory creator objects by name, niche, platform, follower range | Supabase DB `SELECT creator_profiles` joined with `profiles` |
| `src/lib/api/mockApi.ts` | `toggleShortlist()` | Toggles entries in `shortlists` array in localStorage | Supabase DB `shortlists` table with `UNIQUE(brand_id, creator_id)` |
| `src/lib/api/mockApi.ts` | `uploadContract()` | Records filename, returns simulated path, skips physical storage | Supabase Storage private bucket `contracts/{user_id}/{uuid}.pdf` |
| `src/lib/api/mockApi.ts` | `analyzeContract()` | Simulates 1.5s latency, returns pre-cached realistic JSON (§9 schema) | Browser `pdfjs-dist` text extract + Supabase Edge Function `analyze-contract` + `LLM_API_KEY` |
| `src/lib/api/mockApi.ts` | `confirmContractTerms()` | Updates status to `confirmed` and updates deal fields in localStorage | Supabase DB `contract_documents` & `collaborations` update |

---

## 2. Real Business Logic (NOT Faked)

* **Calculations:** `src/lib/calculations.ts` runs 100% real math on all stored records:
  - Net earnings excludes pending income.
  - Pending payments per deal = `MAX(0, payment_amount - ReceivedForD)`.
  - Active collaborations count.
  - Monthly trends zero-fills intermediate missing months.
* **Idempotency & Atomic State:** `acceptEnquiry` enforces that an enquiry cannot be accepted twice and generates only one collaboration.
* **Validation:** Deadlines (`submission <= publishing`), amounts (`> 0`), Indian Rupee formatting (`en-IN`), status state machine (`sent -> accepted/rejected`).
* **Route Guards & Role Separation:** Enforces `/creator/*` vs `/brand/*` access based on user role.

---

## 3. Untested Cloud Services in Mock Mode

When transitioning to `VITE_USE_MOCK=false`, the following cloud infrastructure must be verified:
1. **Row Level Security (RLS) Policies:** Cross-user isolation in PostgreSQL (preventing Creator B from loading Creator A's deals).
2. **Postgres Auth Trigger:** `handle_new_user()` creating `profiles` row from `raw_user_meta_data`.
3. **Postgres RPC Atomicity:** `accept_enquiry` function execution on Supabase server.
4. **Supabase Storage Bucket:** Signed URLs and folder path permissions (`auth.uid()/*`).
5. **Supabase Edge Function:** Deno execution with upstream LLM API key (`analyze-contract`).
