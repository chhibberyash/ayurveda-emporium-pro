
create policy "public read site-assets" on storage.objects for select using (bucket_id = 'site-assets');
create policy "admins upload site-assets" on storage.objects for insert to authenticated with check (bucket_id = 'site-assets' and public.has_role(auth.uid(),'admin'));
create policy "admins update site-assets" on storage.objects for update to authenticated using (bucket_id = 'site-assets' and public.has_role(auth.uid(),'admin'));
create policy "admins delete site-assets" on storage.objects for delete to authenticated using (bucket_id = 'site-assets' and public.has_role(auth.uid(),'admin'));
