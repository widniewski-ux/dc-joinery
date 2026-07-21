-- AI Kitchen Designer schema for Supabase/Postgres

create extension if not exists pgcrypto;

create table if not exists public.ai_design_jobs (
  id uuid primary key default gen_random_uuid(),
  status text not null default 'uploaded',
  input_image_url text not null,
  style text not null,
  color_palette jsonb not null default '[]'::jsonb,
  budget_min integer not null,
  budget_max integer not null,
  customer_notes text null,
  vision_analysis jsonb null,
  generated_image_url text null,
  project_description text null,
  estimated_cost_min integer null,
  estimated_cost_max integer null,
  estimate_explanation text null,
  pdf_report_url text null,
  lead_name text null,
  lead_email text null,
  lead_phone text null,
  lead_message text null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create index if not exists ai_design_jobs_status_idx on public.ai_design_jobs(status);
create index if not exists ai_design_jobs_updated_at_idx on public.ai_design_jobs(updated_at desc);

create or replace function public.set_ai_design_jobs_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

drop trigger if exists ai_design_jobs_updated_at_trigger on public.ai_design_jobs;
create trigger ai_design_jobs_updated_at_trigger
before update on public.ai_design_jobs
for each row
execute function public.set_ai_design_jobs_updated_at();
