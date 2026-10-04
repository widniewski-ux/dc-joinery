-- Apply in Supabase before deploying the matching website code.
-- No customer records or objects are deleted. Legacy projects remain admin-only.
begin;
alter table public.ai_design_jobs add column if not exists owner_hash text;
alter table public.ai_design_jobs add column if not exists lead_email_sent_at timestamptz;
alter table public.ai_design_jobs add column if not exists lead_email_claimed_at timestamptz;
alter table public.ai_design_jobs enable row level security;
revoke all on public.ai_design_jobs from public, anon, authenticated;
grant select, insert, update, delete on public.ai_design_jobs to service_role;
create table if not exists public.website_rate_limits (
  key text primary key, count integer not null, expires_at timestamptz not null
);
create index if not exists website_rate_limits_expiry_idx on public.website_rate_limits(expires_at);
alter table public.website_rate_limits enable row level security;
revoke all on public.website_rate_limits from public, anon, authenticated;
grant all on public.website_rate_limits to service_role;
create or replace function public.consume_website_rate_limit(p_key text, p_limit integer, p_window_ms integer)
returns boolean language plpgsql security invoker set search_path = '' as $$
declare result_count integer;
begin
  if p_limit < 1 or p_window_ms < 1000 or p_window_ms > 86400000 or length(p_key) <> 64 then
    raise exception 'Invalid rate limit parameters';
  end if;
  delete from public.website_rate_limits where expires_at < now();
  insert into public.website_rate_limits as counters (key, count, expires_at)
  values (p_key, 1, now() + p_window_ms * interval '1 millisecond')
  on conflict (key) do update set count = counters.count + 1
  returning count into result_count;
  return result_count <= p_limit;
end;
$$;
revoke all on function public.consume_website_rate_limit(text, integer, integer) from public, anon, authenticated;
grant execute on function public.consume_website_rate_limit(text, integer, integer) to service_role;
-- Brochures are served through the catalog-allowlisted route using signed links.
update storage.buckets set public = false where id = 'ai-designer';
drop policy if exists "dc_private_design_objects" on storage.objects;
create policy "dc_private_design_objects" on storage.objects as restrictive
for all to anon, authenticated
using (bucket_id <> 'ai-designer') with check (bucket_id <> 'ai-designer');
commit;
