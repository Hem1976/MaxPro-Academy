-- Maxpro Academy: initial schema
-- 001_initial_schema.sql

create extension if not exists "pgcrypto";

create type public.user_role as enum (
  'customer',
  'trainer',
  'content_admin',
  'super_admin'
);

create type public.course_level as enum (
  'beginner',
  'intermediate',
  'advanced'
);

create type public.enrollment_status as enum (
  'active',
  'completed',
  'archived'
);

create type public.publish_status as enum (
  'draft',
  'published',
  'archived'
);

create type public.video_provider as enum (
  'external',
  'youtube',
  'vimeo',
  'mux',
  'cloudflare',
  'placeholder'
);

create type public.video_processing_status as enum (
  'uploading',
  'processing',
  'ready',
  'failed'
);

create type public.resource_type as enum (
  'pdf',
  'doc',
  'image',
  'link',
  'spreadsheet',
  'other'
);

create type public.learning_role as enum (
  'sales_representative',
  'sales_manager',
  'administrator',
  'operations',
  'business_owner',
  'trainer'
);

create type public.review_status as enum (
  'current',
  'needs_review',
  'outdated'
);

create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  full_name text,
  email text not null,
  avatar_url text,
  role public.user_role not null default 'customer',
  company text,
  job_title text,
  learning_role public.learning_role,
  preferred_product_ids uuid[] default '{}',
  onboarding_completed boolean not null default false,
  is_active boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.categories (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  description text,
  created_at timestamptz not null default now()
);

create table public.tags (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  created_at timestamptz not null default now()
);

create table public.products (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  short_description text,
  description text,
  logo_url text,
  cover_image_url text,
  category text,
  published boolean not null default false,
  featured boolean not null default false,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.courses (
  id uuid primary key default gen_random_uuid(),
  product_id uuid not null references public.products (id) on delete cascade,
  title text not null,
  slug text not null unique,
  description text,
  short_description text,
  thumbnail_url text,
  level public.course_level not null default 'beginner',
  estimated_minutes integer not null default 0,
  published boolean not null default false,
  featured boolean not null default false,
  certificate_enabled boolean not null default true,
  sort_order integer not null default 0,
  learning_outcomes text[] default '{}',
  status public.publish_status not null default 'draft',
  version text default '1.0',
  last_reviewed_at timestamptz,
  review_status public.review_status not null default 'current',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.course_tags (
  course_id uuid not null references public.courses (id) on delete cascade,
  tag_id uuid not null references public.tags (id) on delete cascade,
  primary key (course_id, tag_id)
);

create table public.modules (
  id uuid primary key default gen_random_uuid(),
  course_id uuid not null references public.courses (id) on delete cascade,
  title text not null,
  description text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.lessons (
  id uuid primary key default gen_random_uuid(),
  module_id uuid not null references public.modules (id) on delete cascade,
  title text not null,
  slug text not null,
  description text,
  learning_objective text,
  video_provider public.video_provider not null default 'placeholder',
  video_id text,
  video_url text,
  duration_seconds integer not null default 0,
  thumbnail_url text,
  transcript text,
  written_content text,
  captions_url text,
  processing_status public.video_processing_status not null default 'ready',
  published boolean not null default false,
  required boolean not null default true,
  sort_order integer not null default 0,
  version text default '1.0',
  last_reviewed_at timestamptz,
  review_status public.review_status not null default 'current',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  unique (module_id, slug)
);

create table public.lesson_resources (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  description text,
  file_url text not null,
  resource_type public.resource_type not null default 'link',
  created_at timestamptz not null default now()
);

create table public.quizzes (
  id uuid primary key default gen_random_uuid(),
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  title text not null,
  description text,
  passing_score integer not null default 70,
  required boolean not null default true,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table public.quiz_questions (
  id uuid primary key default gen_random_uuid(),
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  question text not null,
  explanation text,
  sort_order integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.quiz_options (
  id uuid primary key default gen_random_uuid(),
  question_id uuid not null references public.quiz_questions (id) on delete cascade,
  option_text text not null,
  is_correct boolean not null default false,
  sort_order integer not null default 0
);

create table public.enrollments (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  enrolled_at timestamptz not null default now(),
  completed_at timestamptz,
  status public.enrollment_status not null default 'active',
  unique (user_id, course_id)
);

create table public.lesson_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  lesson_id uuid not null references public.lessons (id) on delete cascade,
  watched_seconds integer not null default 0,
  completed boolean not null default false,
  completed_at timestamptz,
  last_position integer not null default 0,
  updated_at timestamptz not null default now(),
  unique (user_id, lesson_id)
);

create table public.quiz_attempts (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  quiz_id uuid not null references public.quizzes (id) on delete cascade,
  score integer not null,
  passed boolean not null default false,
  answers jsonb not null default '{}'::jsonb,
  attempted_at timestamptz not null default now()
);

create table public.certificates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  course_id uuid not null references public.courses (id) on delete cascade,
  certificate_number text not null unique,
  issued_at timestamptz not null default now(),
  verification_token text not null unique,
  pdf_url text,
  unique (user_id, course_id)
);

create table public.announcements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  content text not null,
  type text not null default 'info',
  published boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.notifications (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles (id) on delete cascade,
  title text not null,
  message text not null,
  type text not null default 'info',
  read boolean not null default false,
  created_at timestamptz not null default now()
);

create table public.analytics_events (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references public.profiles (id) on delete set null,
  event_name text not null,
  entity_type text,
  entity_id uuid,
  metadata jsonb default '{}'::jsonb,
  created_at timestamptz not null default now()
);

create table public.app_settings (
  id uuid primary key default gen_random_uuid(),
  support_email text default 'helpdesk@maxproinfotech.com',
  support_url text default 'https://maxproinfotech.com/contact',
  watch_completion_threshold integer not null default 80,
  updated_at timestamptz not null default now()
);

create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

create trigger profiles_updated_at
before update on public.profiles
for each row execute function public.set_updated_at();

create trigger products_updated_at
before update on public.products
for each row execute function public.set_updated_at();

create trigger courses_updated_at
before update on public.courses
for each row execute function public.set_updated_at();

create trigger modules_updated_at
before update on public.modules
for each row execute function public.set_updated_at();

create trigger lessons_updated_at
before update on public.lessons
for each row execute function public.set_updated_at();

create trigger quizzes_updated_at
before update on public.quizzes
for each row execute function public.set_updated_at();

create trigger lesson_progress_updated_at
before update on public.lesson_progress
for each row execute function public.set_updated_at();

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', split_part(new.email, '@', 1)),
    coalesce((new.raw_user_meta_data->>'role')::public.user_role, 'customer')
  );
  return new;
end;
$$;

create trigger on_auth_user_created
after insert on auth.users
for each row execute function public.handle_new_user();

insert into public.app_settings (support_email, support_url, watch_completion_threshold)
values ('helpdesk@maxproinfotech.com', 'https://maxproinfotech.com/contact', 80);
