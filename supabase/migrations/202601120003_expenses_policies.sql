-- Tighten expense ownership enforcement (self-paid + creator-only edits)
drop policy if exists "expenses_insert" on expenses;
drop policy if exists "expenses_update" on expenses;
drop policy if exists "expenses_delete" on expenses;

create policy "expenses_insert_self_paid" on expenses
  for insert to authenticated
  with check (
    created_by = auth.uid()
    and payer_id = auth.uid()
    and exists (
      select 1 from trip_members
      where trip_members.trip_id = expenses.trip_id
        and trip_members.user_id = auth.uid()
    )
  );

create policy "expenses_update_creator" on expenses
  for update to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1 from trip_members
      where trip_members.trip_id = expenses.trip_id
        and trip_members.user_id = auth.uid()
    )
  )
  with check (
    created_by = auth.uid()
    and payer_id = auth.uid()
  );

create policy "expenses_delete_creator" on expenses
  for delete to authenticated
  using (
    created_by = auth.uid()
    and exists (
      select 1 from trip_members
      where trip_members.trip_id = expenses.trip_id
        and trip_members.user_id = auth.uid()
    )
  );
