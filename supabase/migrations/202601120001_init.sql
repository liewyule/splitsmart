-- SplitSmart schema and RLS policies
create extension if not exists "pgcrypto";

create table if not exists profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique not null,
  created_at timestamp with time zone default now()
);

create table if not exists trips (
  id uuid primary key default gen_random_uuid(),
  code text unique not null,
  name text not null,
  created_by uuid references profiles(id),
  created_at timestamp with time zone default now()
);

create table if not exists trip_members (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  joined_at timestamp with time zone default now(),
  unique (trip_id, user_id)
);

create table if not exists expenses (
  id uuid primary key default gen_random_uuid(),
  trip_id uuid references trips(id) on delete cascade,
  title text not null,
  amount numeric(12,2) not null check (amount >= 0),
  payer_id uuid references profiles(id) not null,
  created_by uuid references profiles(id) not null,
  created_at timestamp with time zone default now()
);

create table if not exists expense_splits (
  id uuid primary key default gen_random_uuid(),
  expense_id uuid references expenses(id) on delete cascade,
  user_id uuid references profiles(id) on delete cascade,
  amount numeric(12,2) not null check (amount >= 0),
  unique (expense_id, user_id)
);

alter table profiles enable row level security;
alter table trips enable row level security;
alter table trip_members enable row level security;
alter table expenses enable row level security;
alter table expense_splits enable row level security;

create or replace function public.is_trip_member(p_trip_id uuid, p_user_id uuid)
returns boolean
language sql
security definer
set search_path = public
as $$
  select exists (
    select 1 from trip_members
    where trip_members.trip_id = p_trip_id
      and trip_members.user_id = p_user_id
  );
$$;

-- profiles policies
create policy "profiles_select" on profiles
  for select to authenticated
  using (true);

create policy "profiles_insert" on profiles
  for insert to authenticated
  with check (id = auth.uid());

create policy "profiles_update" on profiles
  for update to authenticated
  using (id = auth.uid())
  with check (id = auth.uid());

-- trips policies
create policy "trips_select_members" on trips
  for select to authenticated
  using (
    created_by = auth.uid()
    or exists (
      select 1 from trip_members
      where trip_members.trip_id = trips.id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "trips_insert" on trips
  for insert to authenticated
  with check (created_by = auth.uid());

create policy "trips_update_creator" on trips
  for update to authenticated
  using (created_by = auth.uid())
  with check (created_by = auth.uid());

create policy "trips_delete_creator" on trips
  for delete to authenticated
  using (created_by = auth.uid());

-- trip_members policies
create policy "trip_members_select" on trip_members
  for select to authenticated
  using (is_trip_member(trip_members.trip_id, auth.uid()));

create policy "trip_members_insert_self" on trip_members
  for insert to authenticated
  with check (user_id = auth.uid());

-- expenses policies
create policy "expenses_select" on expenses
  for select to authenticated
  using (exists (
    select 1 from trip_members
    where trip_members.trip_id = expenses.trip_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expenses_insert" on expenses
  for insert to authenticated
  with check (exists (
    select 1 from trip_members
    where trip_members.trip_id = expenses.trip_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expenses_update" on expenses
  for update to authenticated
  using (exists (
    select 1 from trip_members
    where trip_members.trip_id = expenses.trip_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expenses_delete" on expenses
  for delete to authenticated
  using (exists (
    select 1 from trip_members
    where trip_members.trip_id = expenses.trip_id
      and trip_members.user_id = auth.uid()
  ));

-- expense_splits policies
create policy "expense_splits_select" on expense_splits
  for select to authenticated
  using (exists (
    select 1 from expenses
    join trip_members on trip_members.trip_id = expenses.trip_id
    where expenses.id = expense_splits.expense_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expense_splits_insert" on expense_splits
  for insert to authenticated
  with check (exists (
    select 1 from expenses
    join trip_members on trip_members.trip_id = expenses.trip_id
    where expenses.id = expense_splits.expense_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expense_splits_update" on expense_splits
  for update to authenticated
  using (exists (
    select 1 from expenses
    join trip_members on trip_members.trip_id = expenses.trip_id
    where expenses.id = expense_splits.expense_id
      and trip_members.user_id = auth.uid()
  ));

create policy "expense_splits_delete" on expense_splits
  for delete to authenticated
  using (exists (
    select 1 from expenses
    join trip_members on trip_members.trip_id = expenses.trip_id
    where expenses.id = expense_splits.expense_id
      and trip_members.user_id = auth.uid()
  ));
