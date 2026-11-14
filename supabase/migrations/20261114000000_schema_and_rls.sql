-- ========================================================
-- Creatix - Initial Schema and Row Level Security (RLS)
-- Meets PRD §0, §6, §11 + User Decisions (1, 2, 4, 5)
-- ========================================================

-- Enable UUID extension
create extension if not exists "uuid-ossp";

-- --------------------------------------------------------
-- 1. PROFILES TABLE (§6)
-- --------------------------------------------------------
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  name text,
  email text,
  role text not null check (role in ('creator', 'brand')),
  created_at timestamptz not null default now()
);

-- Trigger to prevent role updates (§0 #8)
create or replace function public.prevent_role_update()
returns trigger as $$
begin
  if new.role is distinct from old.role then
    raise exception 'Updating user role is not permitted';
  end if;
  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists tr_prevent_role_update on public.profiles;
create trigger tr_prevent_role_update
  before update on public.profiles
  for each row execute function public.prevent_role_update();

-- Auto-create profile from auth signup metadata (Decision 4)
create or replace function public.handle_new_user()
returns trigger as $$
declare
  v_role text;
  v_name text;
begin
  v_role := coalesce(new.raw_user_meta_data->>'role', 'creator');
  v_name := coalesce(new.raw_user_meta_data->>'name', split_part(new.email, '@', 1));

  insert into public.profiles (id, name, email, role, created_at)
  values (new.id, v_name, new.email, v_role, now())
  on conflict (id) do nothing;

  if v_role = 'creator' then
    insert into public.creator_profiles (user_id, display_name, bio, niche, is_public)
    values (new.id, v_name, '', 'Beauty & Lifestyle', false)
    on conflict (user_id) do nothing;
  elsif v_role = 'brand' then
    insert into public.brand_profiles (user_id, brand_name, description)
    values (new.id, v_name, '')
    on conflict (user_id) do nothing;
  end if;

  return new;
end;
$$ language plpgsql security definer;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();

-- --------------------------------------------------------
-- 2. CREATOR PROFILES TABLE (§6 + Decision 1)
-- --------------------------------------------------------
create table if not exists public.creator_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  display_name text, -- Decision 1
  bio text default '',
  niche text default 'Beauty & Lifestyle',
  expertise text[] default '{}',
  location text default '',
  profile_image_url text default '',
  instagram_url text default '',
  youtube_url text default '',
  other_links text[] default '{}',
  follower_count int default 0 check (follower_count >= 0),
  subscriber_count int default 0 check (subscriber_count >= 0),
  average_views int default 0 check (average_views >= 0),
  engagement_rate numeric(5,2) default 0.00 check (engagement_rate >= 0 and engagement_rate <= 100),
  portfolio_links text[] default '{}',
  is_public boolean not null default false,
  updated_at timestamptz not null default now()
);

-- --------------------------------------------------------
-- 3. BRAND PROFILES TABLE (§6)
-- --------------------------------------------------------
create table if not exists public.brand_profiles (
  user_id uuid primary key references public.profiles(id) on delete cascade,
  brand_name text not null default '',
  description text default '',
  industry text default '',
  website text default '',
  logo_url text default ''
);

-- --------------------------------------------------------
-- 4. ENQUIRIES TABLE (§6, §5.4)
-- --------------------------------------------------------
create table if not exists public.enquiries (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  brand_id uuid not null references public.profiles(id) on delete cascade,
  campaign_title text not null,
  description text not null,
  offered_payment numeric(12,2) not null check (offered_payment >= 0),
  deliverables text default '',
  deadline date,
  additional_requirements text default '',
  status text not null default 'sent' check (status in ('sent', 'accepted', 'rejected')),
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------
-- 5. COLLABORATIONS TABLE (§0 #4, §6, §5.3)
-- --------------------------------------------------------
create table if not exists public.collaborations (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  brand_id uuid references public.profiles(id) on delete set null,
  enquiry_id uuid unique references public.enquiries(id) on delete set null,
  brand_name text not null,
  campaign_title text not null,
  description text default '',
  payment_amount numeric(12,2) not null default 0.00 check (payment_amount >= 0),
  deliverables text default '',
  submission_deadline date,
  publishing_deadline date,
  deal_status text not null default 'pending' check (deal_status in ('pending', 'accepted', 'in_progress', 'completed', 'cancelled')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'partially_paid', 'paid')),
  notes text default '',
  show_on_profile boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  constraint check_deadlines check (submission_deadline is null or publishing_deadline is null or submission_deadline <= publishing_deadline)
);

-- --------------------------------------------------------
-- 6. CONTRACT DOCUMENTS TABLE (§0 #4, §6, §5.6)
-- --------------------------------------------------------
create table if not exists public.contract_documents (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  collaboration_id uuid references public.collaborations(id) on delete set null,
  file_path text,
  original_filename text,
  extracted_text text,
  ai_summary text,
  ai_flags jsonb default '[]'::jsonb,
  extracted_terms jsonb default '{}'::jsonb,
  review_status text not null default 'pending' check (review_status in ('pending', 'confirmed')),
  uploaded_at timestamptz not null default now()
);

-- --------------------------------------------------------
-- 7. FINANCIAL RECORDS TABLE (§6, §5.7)
-- --------------------------------------------------------
create table if not exists public.financial_records (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id) on delete cascade,
  collaboration_id uuid references public.collaborations(id) on delete set null,
  record_type text not null check (record_type in ('income', 'expense')),
  category text not null,
  amount numeric(12,2) not null check (amount > 0),
  description text default '',
  transaction_date date not null default current_date,
  payment_status text not null default 'received' check (payment_status in ('received', 'pending')),
  created_at timestamptz not null default now()
);

-- --------------------------------------------------------
-- 8. SHORTLISTS TABLE (§6, §5.5)
-- --------------------------------------------------------
create table if not exists public.shortlists (
  id uuid primary key default gen_random_uuid(),
  brand_id uuid not null references public.profiles(id) on delete cascade,
  creator_id uuid not null references public.profiles(id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (brand_id, creator_id)
);

-- --------------------------------------------------------
-- 9. ATOMIC ENQUIRY RPC FUNCTIONS (Decision 2)
-- --------------------------------------------------------
create or replace function public.accept_enquiry(p_enquiry_id uuid)
returns uuid as $$
declare
  v_enquiry record;
  v_brand_name text;
  v_collab_id uuid;
begin
  -- Verify enquiry exists, is addressed to caller, and is in 'sent' status
  select * into v_enquiry
  from public.enquiries
  where id = p_enquiry_id and creator_id = auth.uid()
  for update;

  if not found then
    raise exception 'Enquiry not found or access denied';
  end if;

  if v_enquiry.status != 'sent' then
    raise exception 'Only sent enquiries can be accepted';
  end if;

  -- Lookup brand name
  select coalesce(bp.brand_name, p.name, 'Brand') into v_brand_name
  from public.profiles p
  left join public.brand_profiles bp on bp.user_id = p.id
  where p.id = v_enquiry.brand_id;

  -- 1. Mark enquiry accepted
  update public.enquiries
  set status = 'accepted'
  where id = p_enquiry_id;

  -- 2. Create collaboration atomically (idempotent via unique enquiry_id)
  insert into public.collaborations (
    creator_id,
    brand_id,
    enquiry_id,
    brand_name,
    campaign_title,
    description,
    payment_amount,
    deliverables,
    publishing_deadline,
    deal_status,
    payment_status
  ) values (
    v_enquiry.creator_id,
    v_enquiry.brand_id,
    v_enquiry.id,
    coalesce(v_brand_name, 'Brand Partner'),
    v_enquiry.campaign_title,
    v_enquiry.description,
    v_enquiry.offered_payment,
    v_enquiry.deliverables,
    v_enquiry.deadline,
    'accepted',
    'pending'
  )
  returning id into v_collab_id;

  return v_collab_id;
end;
$$ language plpgsql security definer;

create or replace function public.reject_enquiry(p_enquiry_id uuid)
returns boolean as $$
declare
  v_enquiry record;
begin
  select * into v_enquiry
  from public.enquiries
  where id = p_enquiry_id and creator_id = auth.uid()
  for update;

  if not found then
    raise exception 'Enquiry not found or access denied';
  end if;

  if v_enquiry.status != 'sent' then
    raise exception 'Only sent enquiries can be rejected';
  end if;

  update public.enquiries
  set status = 'rejected'
  where id = p_enquiry_id;

  return true;
end;
$$ language plpgsql security definer;

-- --------------------------------------------------------
-- 10. ROW LEVEL SECURITY (RLS) POLICIES (§6 + Decision 5)
-- --------------------------------------------------------

-- Enable RLS on all tables
alter table public.profiles enable row level security;
alter table public.creator_profiles enable row level security;
alter table public.brand_profiles enable row level security;
alter table public.collaborations enable row level security;
alter table public.contract_documents enable row level security;
alter table public.financial_records enable row level security;
alter table public.enquiries enable row level security;
alter table public.shortlists enable row level security;

-- PROFILES
create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id)
  with check (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

-- CREATOR_PROFILES (Decision 5: public-read applies to anon too)
create policy "Anyone can view public creator profiles"
  on public.creator_profiles for select
  using (is_public = true or auth.uid() = user_id);

create policy "Creators can update own creator profile"
  on public.creator_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Creators can insert own creator profile"
  on public.creator_profiles for insert
  with check (auth.uid() = user_id);

-- BRAND_PROFILES
create policy "Brand owners and creators can view brand profile"
  on public.brand_profiles for select
  using (auth.uid() = user_id or exists (
    select 1 from public.profiles where id = auth.uid() and role = 'creator'
  ));

create policy "Brands can update own brand profile"
  on public.brand_profiles for update
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "Brands can insert own brand profile"
  on public.brand_profiles for insert
  with check (auth.uid() = user_id);

-- COLLABORATIONS (Creator only - no brand access)
create policy "Creators have full access to own collaborations"
  on public.collaborations for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- CONTRACT_DOCUMENTS (Creator only - no brand access)
create policy "Creators have full access to own contracts"
  on public.contract_documents for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- FINANCIAL_RECORDS (Creator only - no brand access)
create policy "Creators have full access to own financial records"
  on public.financial_records for all
  using (creator_id = auth.uid())
  with check (creator_id = auth.uid());

-- ENQUIRIES
create policy "Brands can insert enquiries"
  on public.enquiries for insert
  with check (brand_id = auth.uid());

create policy "Parties can view their enquiries"
  on public.enquiries for select
  using (brand_id = auth.uid() or creator_id = auth.uid());

-- Note: Enquiry updates are handled by secure RPC functions (accept_enquiry, reject_enquiry)

-- SHORTLISTS (Brand only)
create policy "Brands have full access to own shortlists"
  on public.shortlists for all
  using (brand_id = auth.uid())
  with check (brand_id = auth.uid());

-- --------------------------------------------------------
-- 11. STORAGE BUCKET CONFIGURATION (PRD §0 #9, §6)
-- --------------------------------------------------------
insert into storage.buckets (id, name, public)
values ('contracts', 'contracts', false)
on conflict (id) do update set public = false;

create policy "Creators have full access to own contract storage"
  on storage.objects for all
  using (bucket_id = 'contracts' and (storage.foldername(name))[1] = auth.uid()::text)
  with check (bucket_id = 'contracts' and (storage.foldername(name))[1] = auth.uid()::text);
