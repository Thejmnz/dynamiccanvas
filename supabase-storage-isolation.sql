-- Run once in the Supabase SQL editor (or against the project's Postgres DB).
-- Public object URLs continue to work because `media` is a public bucket, but
-- clients can no longer enumerate or mutate every object through the Storage API.
-- All application writes now go through authenticated server routes.

drop policy if exists "Public Access" on storage.objects;
drop policy if exists "Authenticated users can upload" on storage.objects;
drop policy if exists "Authenticated users can update" on storage.objects;
drop policy if exists "Authenticated users can delete" on storage.objects;
