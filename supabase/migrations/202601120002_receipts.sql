-- Add receipt image support
alter table if exists expenses
  add column if not exists receipt_url text;

-- Create receipts storage bucket
insert into storage.buckets (id, name, public)
values ('receipts', 'receipts', true)
on conflict (id) do nothing;

-- Storage policies for receipts bucket
drop policy if exists "Receipts read" on storage.objects;
drop policy if exists "Receipts insert" on storage.objects;
drop policy if exists "Receipts update" on storage.objects;
drop policy if exists "Receipts delete" on storage.objects;

create policy "Receipts read" on storage.objects
  for select to authenticated
  using (bucket_id = 'receipts');

create policy "Receipts insert" on storage.objects
  for insert to authenticated
  with check (bucket_id = 'receipts');

create policy "Receipts update" on storage.objects
  for update to authenticated
  using (bucket_id = 'receipts')
  with check (bucket_id = 'receipts');

create policy "Receipts delete" on storage.objects
  for delete to authenticated
  using (bucket_id = 'receipts');
