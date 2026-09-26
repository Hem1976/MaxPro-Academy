alter table public.profiles
  add column if not exists phone text;

comment on column public.profiles.phone is 'Learner phone number (e.g. from external CSV import)';
