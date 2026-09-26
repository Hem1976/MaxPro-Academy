-- Maxpro Academy: row level security
-- 002_rls.sql

alter table public.profiles enable row level security;
alter table public.categories enable row level security;
alter table public.tags enable row level security;
alter table public.products enable row level security;
alter table public.courses enable row level security;
alter table public.course_tags enable row level security;
alter table public.modules enable row level security;
alter table public.lessons enable row level security;
alter table public.lesson_resources enable row level security;
alter table public.quizzes enable row level security;
alter table public.quiz_questions enable row level security;
alter table public.quiz_options enable row level security;
alter table public.enrollments enable row level security;
alter table public.lesson_progress enable row level security;
alter table public.quiz_attempts enable row level security;
alter table public.certificates enable row level security;
alter table public.announcements enable row level security;
alter table public.notifications enable row level security;
alter table public.analytics_events enable row level security;
alter table public.app_settings enable row level security;

create or replace function public.current_user_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid();
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('trainer', 'content_admin', 'super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role in ('content_admin', 'super_admin') from public.profiles where id = auth.uid()),
    false
  );
$$;

create or replace function public.is_super_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select coalesce(
    (select role = 'super_admin' from public.profiles where id = auth.uid()),
    false
  );
$$;

-- Profiles
create policy "Users can view own profile"
on public.profiles for select
using (auth.uid() = id or public.is_staff());

create policy "Users can update own profile"
on public.profiles for update
using (auth.uid() = id)
with check (
  auth.uid() = id
  and role = (select role from public.profiles where id = auth.uid())
);

create policy "Admins can update profiles"
on public.profiles for update
using (public.is_admin());

create policy "Admins can view all profiles"
on public.profiles for select
using (public.is_admin());

-- Categories & tags (public read)
create policy "Anyone can read categories"
on public.categories for select
using (true);

create policy "Admins manage categories"
on public.categories for all
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can read tags"
on public.tags for select
using (true);

create policy "Admins manage tags"
on public.tags for all
using (public.is_admin())
with check (public.is_admin());

-- Products
create policy "Anyone can read published products"
on public.products for select
using (published = true or public.is_staff());

create policy "Admins manage products"
on public.products for all
using (public.is_admin())
with check (public.is_admin());

-- Courses
create policy "Anyone can read published courses"
on public.courses for select
using (
  (published = true and status = 'published')
  or public.is_staff()
);

create policy "Admins manage courses"
on public.courses for all
using (public.is_admin())
with check (public.is_admin());

create policy "Anyone can read course tags for published courses"
on public.course_tags for select
using (
  exists (
    select 1 from public.courses c
    where c.id = course_id
      and (c.published = true or public.is_staff())
  )
);

create policy "Admins manage course tags"
on public.course_tags for all
using (public.is_admin())
with check (public.is_admin());

-- Modules
create policy "Anyone can read modules of published courses"
on public.modules for select
using (
  exists (
    select 1 from public.courses c
    where c.id = course_id
      and ((c.published = true and c.status = 'published') or public.is_staff())
  )
);

create policy "Admins manage modules"
on public.modules for all
using (public.is_admin())
with check (public.is_admin());

-- Lessons
create policy "Anyone can read published lessons"
on public.lessons for select
using (
  (
    published = true
    and exists (
      select 1
      from public.modules m
      join public.courses c on c.id = m.course_id
      where m.id = module_id
        and c.published = true
        and c.status = 'published'
    )
  )
  or public.is_staff()
);

create policy "Admins manage lessons"
on public.lessons for all
using (public.is_admin())
with check (public.is_admin());

-- Lesson resources
create policy "Anyone can read resources for published lessons"
on public.lesson_resources for select
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id
      and (l.published = true or public.is_staff())
  )
);

create policy "Admins manage lesson resources"
on public.lesson_resources for all
using (public.is_admin())
with check (public.is_admin());

-- Quizzes
create policy "Authenticated users can read quizzes for published lessons"
on public.quizzes for select
to authenticated
using (
  exists (
    select 1 from public.lessons l
    where l.id = lesson_id
      and (l.published = true or public.is_staff())
  )
);

create policy "Admins manage quizzes"
on public.quizzes for all
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read quiz questions"
on public.quiz_questions for select
to authenticated
using (
  exists (
    select 1
    from public.quizzes q
    join public.lessons l on l.id = q.lesson_id
    where q.id = quiz_id
      and (l.published = true or public.is_staff())
  )
);

create policy "Admins manage quiz questions"
on public.quiz_questions for all
using (public.is_admin())
with check (public.is_admin());

create policy "Authenticated users can read quiz options"
on public.quiz_options for select
to authenticated
using (
  exists (
    select 1
    from public.quiz_questions qq
    join public.quizzes q on q.id = qq.quiz_id
    join public.lessons l on l.id = q.lesson_id
    where qq.id = question_id
      and (l.published = true or public.is_staff())
  )
);

create policy "Admins manage quiz options"
on public.quiz_options for all
using (public.is_admin())
with check (public.is_admin());

-- Enrollments
create policy "Users manage own enrollments"
on public.enrollments for select
using (auth.uid() = user_id or public.is_staff());

create policy "Users can enroll themselves"
on public.enrollments for insert
with check (auth.uid() = user_id);

create policy "Users can update own enrollments"
on public.enrollments for update
using (auth.uid() = user_id or public.is_admin());

-- Lesson progress
create policy "Users manage own lesson progress"
on public.lesson_progress for select
using (auth.uid() = user_id or public.is_staff());

create policy "Users insert own lesson progress"
on public.lesson_progress for insert
with check (auth.uid() = user_id);

create policy "Users update own lesson progress"
on public.lesson_progress for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

-- Quiz attempts
create policy "Users view own quiz attempts"
on public.quiz_attempts for select
using (auth.uid() = user_id or public.is_staff());

create policy "Users insert own quiz attempts"
on public.quiz_attempts for insert
with check (auth.uid() = user_id);

-- Certificates
create policy "Users view own certificates"
on public.certificates for select
using (auth.uid() = user_id or public.is_staff());

create policy "Public can verify certificates by token"
on public.certificates for select
using (true);

create policy "Admins manage certificates"
on public.certificates for all
using (public.is_admin())
with check (public.is_admin());

-- Announcements
create policy "Anyone can read published announcements"
on public.announcements for select
using (published = true or public.is_staff());

create policy "Admins manage announcements"
on public.announcements for all
using (public.is_admin())
with check (public.is_admin());

-- Notifications
create policy "Users view own notifications"
on public.notifications for select
using (auth.uid() = user_id);

create policy "Users update own notifications"
on public.notifications for update
using (auth.uid() = user_id)
with check (auth.uid() = user_id);

create policy "Admins manage notifications"
on public.notifications for all
using (public.is_admin())
with check (public.is_admin());

-- Analytics events
create policy "Users insert own analytics events"
on public.analytics_events for insert
with check (auth.uid() = user_id or user_id is null);

create policy "Admins read analytics events"
on public.analytics_events for select
using (public.is_admin());

-- App settings
create policy "Anyone can read app settings"
on public.app_settings for select
using (true);

create policy "Super admins manage app settings"
on public.app_settings for all
using (public.is_super_admin())
with check (public.is_super_admin());
