create type public.course_kind as enum ('internal', 'external');

alter table public.courses
  add column if not exists course_kind public.course_kind not null default 'internal';

comment on column public.courses.course_kind is
  'internal = Academy lessons/videos; external = third-party training with uploaded questionnaire';
