alter table public.profiles
  add column if not exists timezone text,
  add column if not exists locale text;

comment on column public.profiles.timezone is 'IANA timezone for learner-facing dates and reminders';
comment on column public.profiles.locale is 'BCP 47 / locale tag for UI language preference';
